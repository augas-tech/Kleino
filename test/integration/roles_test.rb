require "test_helper"

class RolesTest < ActionDispatch::IntegrationTest
  test "el registro siempre crea un usuario normal aunque se envíe un rol" do
    post registration_path, params: { email_address: "intruso@example.com", password: "clave12345", password_confirmation: "clave12345", rol: "administrador" }, as: :json

    assert_response :created
    assert_equal "usuario", User.find_by!(email_address: "intruso@example.com").rol
    assert_equal "usuario", response.parsed_body.dig("user", "rol")
  end

  test "GET /session informa el rol del usuario" do
    sign_in_as(users(:admin))

    get session_path

    assert_response :success
    assert_equal "administrador", response.parsed_body.dig("user", "rol")
  end

  test "el 403 responde con un mensaje de error en JSON" do
    sign_in_as(users(:one))

    post sedes_path, params: { nombre: "Nueva" }, as: :json

    assert_response :forbidden
    assert_equal "No tienes permiso para realizar esta acción", response.parsed_body["error"]
  end
end
