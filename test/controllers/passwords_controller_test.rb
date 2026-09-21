require "test_helper"

class PasswordsControllerTest < ActionDispatch::IntegrationTest
  setup { @user = User.take }

  test "create" do
    post passwords_path, params: { email_address: @user.email_address }, as: :json

    assert_enqueued_email_with PasswordsMailer, :reset, args: [ @user ]
    assert_response :success
  end

  test "create for an unknown user responds the same but sends no mail" do
    post passwords_path, params: { email_address: "missing-user@example.com" }, as: :json

    assert_enqueued_emails 0
    assert_response :success
  end

  test "edit with valid token" do
    get edit_password_path(@user.password_reset_token)

    assert_response :success
    assert_equal true, response.parsed_body["valid"]
  end

  test "edit with invalid password reset token" do
    get edit_password_path("invalid token")

    assert_response :unprocessable_content
  end

  test "update" do
    assert_changes -> { @user.reload.password_digest } do
      put password_path(@user.password_reset_token), params: { password: "nueva-clave-123", password_confirmation: "nueva-clave-123" }, as: :json
      assert_response :success
    end
  end

  test "update with non matching passwords" do
    token = @user.password_reset_token

    assert_no_changes -> { @user.reload.password_digest } do
      put password_path(token), params: { password: "clave12345", password_confirmation: "otra123456" }, as: :json
      assert_response :unprocessable_content
    end
  end

  test "update without password" do
    assert_no_changes -> { @user.reload.password_digest } do
      put password_path(@user.password_reset_token), params: {}, as: :json
      assert_response :bad_request
    end
  end
end
