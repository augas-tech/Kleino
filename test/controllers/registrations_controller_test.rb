require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "create with valid data" do
    assert_difference "User.count", 1 do
      post registration_path, params: { email_address: "  Nuevo@Example.com ", password: "clave12345", password_confirmation: "clave12345" }, as: :json
    end

    assert_response :created
    assert cookies[:session_id]
    assert_equal "nuevo@example.com", response.parsed_body.dig("user", "email_address")
  end

  test "create with duplicated email" do
    assert_no_difference "User.count" do
      post registration_path, params: { email_address: users(:one).email_address, password: "clave12345", password_confirmation: "clave12345" }, as: :json
    end

    assert_response :unprocessable_content
    assert_nil cookies[:session_id]
  end

  test "create with invalid email" do
    assert_no_difference "User.count" do
      post registration_path, params: { email_address: "no-es-un-email", password: "clave12345", password_confirmation: "clave12345" }, as: :json
    end

    assert_response :unprocessable_content
  end

  test "create with short password" do
    assert_no_difference "User.count" do
      post registration_path, params: { email_address: "corta@example.com", password: "corta", password_confirmation: "corta" }, as: :json
    end

    assert_response :unprocessable_content
  end

  test "create with non matching confirmation" do
    assert_no_difference "User.count" do
      post registration_path, params: { email_address: "no.coincide@example.com", password: "clave12345", password_confirmation: "otra123456" }, as: :json
    end

    assert_response :unprocessable_content
  end
end
