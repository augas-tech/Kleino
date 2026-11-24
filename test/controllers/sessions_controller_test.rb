require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup { @user = User.take }

  test "create with valid credentials" do
    post session_path, params: { email_address: @user.email_address, password: "password" }, as: :json

    assert_response :created
    assert cookies[:session_id]
    assert_equal @user.email_address, response.parsed_body.dig("user", "email_address")
    assert_nil response.parsed_body.dig("user", "password_digest")
  end

  test "create with invalid credentials" do
    post session_path, params: { email_address: @user.email_address, password: "wrong" }, as: :json

    assert_response :unauthorized
    assert_nil cookies[:session_id]
  end

  test "create without password" do
    post session_path, params: { email_address: @user.email_address }, as: :json

    assert_response :unauthorized
    assert_nil cookies[:session_id]
  end

  test "show without session" do
    get session_path

    assert_response :unauthorized
  end

  test "show with session" do
    sign_in_as(@user)

    get session_path

    assert_response :success
    assert_equal @user.email_address, response.parsed_body.dig("user", "email_address")
  end

  test "destroy" do
    sign_in_as(@user)

    delete session_path

    assert_response :no_content
    assert_empty cookies[:session_id]
  end

  test "login movil devuelve token y no crea cookie" do
    post session_path, params: { email_address: @user.email_address, password: "password" },
         headers: { "X-Client" => "mobile" }, as: :json

    assert_response :created
    assert response.parsed_body["token"].present?
    assert_nil cookies[:session_id]
  end

  test "login web no devuelve token" do
    post session_path, params: { email_address: @user.email_address, password: "password" }, as: :json

    assert_response :created
    assert_nil response.parsed_body["token"]
    assert cookies[:session_id]
  end

  test "show con token valido" do
    post session_path, params: { email_address: @user.email_address, password: "password" },
         headers: { "X-Client" => "mobile" }, as: :json
    token = response.parsed_body["token"]

    get session_path, headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    assert_equal @user.email_address, response.parsed_body.dig("user", "email_address")
  end

  test "show con token invalido" do
    get session_path, headers: { "Authorization" => "Bearer token-falso" }

    assert_response :unauthorized
  end

  test "logout revoca el token" do
    post session_path, params: { email_address: @user.email_address, password: "password" },
         headers: { "X-Client" => "mobile" }, as: :json
    auth = { "Authorization" => "Bearer #{response.parsed_body['token']}" }

    delete session_path, headers: auth
    assert_response :no_content

    get session_path, headers: auth
    assert_response :unauthorized
  end
end
