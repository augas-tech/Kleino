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
end
