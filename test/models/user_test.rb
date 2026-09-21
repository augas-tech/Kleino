require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "downcases and strips email_address" do
    user = User.new(email_address: " DOWNCASED@EXAMPLE.COM ")
    assert_equal("downcased@example.com", user.email_address)
  end

  test "valid with email and password" do
    user = User.new(email_address: "valido@example.com", password: "clave12345")
    assert user.valid?
  end

  test "requires a valid email" do
    user = User.new(email_address: "sin-arroba", password: "clave12345")
    assert_not user.valid?
    assert user.errors[:email_address].any?
  end

  test "requires a unique email" do
    user = User.new(email_address: users(:one).email_address, password: "clave12345")
    assert_not user.valid?
    assert user.errors[:email_address].any?
  end

  test "requires a password of at least 8 characters" do
    user = User.new(email_address: "corta@example.com", password: "corta")
    assert_not user.valid?
    assert user.errors[:password].any?
  end

  test "as_public_json does not expose the password digest" do
    assert_equal %i[ email_address id ], users(:one).as_public_json.keys.sort
  end
end
