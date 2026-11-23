require "test_helper"

class SedesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = users(:admin)
    @usuario = users(:one)
    @sede = sedes(:one)   # del admin
    @ajena = sedes(:two)  # de otro_admin
  end

  test "sin sesión responde 401" do
    get sedes_path

    assert_response :unauthorized
  end

  test "un usuario puede ver las sedes" do
    sign_in_as(@usuario)

    get sedes_path

    assert_response :success
  end

  test "un usuario no puede crear sedes" do
    sign_in_as(@usuario)

    assert_no_difference "Sede.count" do
      post sedes_path, params: { nombre: "Nueva", direccion: "Calle 1" }, as: :json
    end

    assert_response :forbidden
  end

  test "un administrador crea una sede y queda como propietario" do
    sign_in_as(@admin)

    assert_difference "Sede.count", 1 do
      post sedes_path, params: { nombre: "Nueva", direccion: "Calle 1" }, as: :json
    end

    assert_response :created
    assert_equal @admin.id, response.parsed_body["propietario_id"]
  end

  test "un administrador edita su propia sede" do
    sign_in_as(@admin)

    patch sede_path(@sede), params: { nombre: "Renombrada" }, as: :json

    assert_response :success
    assert_equal "Renombrada", @sede.reload.nombre
  end

  test "un administrador no puede editar la sede de otro" do
    sign_in_as(@admin)

    patch sede_path(@ajena), params: { nombre: "Hackeada" }, as: :json

    assert_response :forbidden
    assert_not_equal "Hackeada", @ajena.reload.nombre
  end

  test "un administrador no puede borrar la sede de otro" do
    sign_in_as(@admin)

    assert_no_difference "Sede.count" do
      delete sede_path(@ajena)
    end

    assert_response :forbidden
  end

  test "no se puede borrar una sede que tiene espacios" do
    sign_in_as(@admin)

    assert_no_difference "Sede.count" do
      delete sede_path(@sede)
    end

    assert_response :unprocessable_content
  end
end
