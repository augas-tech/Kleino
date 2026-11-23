require "test_helper"

class EspaciosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = users(:admin)
    @otro_admin = users(:otro_admin)
    @usuario = users(:one)
    @espacio = espacios(:one)      # activo, sede del admin
    @ajeno = espacios(:two)        # activo, sede de otro_admin
    @cerrado = espacios(:cerrado)  # inactivo, sede del admin
  end

  test "sin sesión responde 401" do
    get espacios_path

    assert_response :unauthorized
  end

  test "un usuario solo ve los espacios activos" do
    sign_in_as(@usuario)

    get espacios_path

    assert_response :success
    ids = response.parsed_body.map { |e| e["id"] }
    assert_includes ids, @espacio.id
    assert_not_includes ids, @cerrado.id
  end

  test "un administrador ve sus espacios inactivos" do
    sign_in_as(@admin)

    get espacios_path

    assert_includes response.parsed_body.map { |e| e["id"] }, @cerrado.id
  end

  test "un administrador no ve los espacios inactivos de otro" do
    sign_in_as(@otro_admin)

    get espacios_path

    assert_not_includes response.parsed_body.map { |e| e["id"] }, @cerrado.id
  end

  test "un usuario no puede ver un espacio inactivo" do
    sign_in_as(@usuario)

    get espacio_path(@cerrado)

    assert_response :not_found
  end

  test "un usuario no puede crear espacios" do
    sign_in_as(@usuario)

    assert_no_difference "Espacio.count" do
      post espacios_path, params: datos_espacio, as: :json
    end

    assert_response :forbidden
  end

  test "un administrador crea un espacio con horario en su sede" do
    sign_in_as(@admin)

    assert_difference "Espacio.count", 1 do
      post espacios_path, params: datos_espacio, as: :json
    end

    assert_response :created
    assert_equal 6, response.parsed_body["capacidad"]
  end

  test "un administrador no puede crear espacios en la sede de otro" do
    sign_in_as(@admin)

    assert_no_difference "Espacio.count" do
      post espacios_path, params: datos_espacio(sede_id: sedes(:two).id), as: :json
    end

    assert_response :forbidden
  end

  test "un administrador cierra su espacio" do
    sign_in_as(@admin)

    patch espacio_path(@espacio), params: { estado: "inactivo" }, as: :json

    assert_response :success
    assert_equal "inactivo", @espacio.reload.estado
  end

  test "un administrador cambia el horario y la capacidad de su espacio" do
    sign_in_as(@admin)

    patch espacio_path(@espacio), params: { capacidad: 4, hora_apertura: "09:00", hora_cierre: "18:00" }, as: :json

    assert_response :success
    assert_equal 4, @espacio.reload.capacidad
  end

  test "un horario con cierre antes de la apertura responde 422" do
    sign_in_as(@admin)

    patch espacio_path(@espacio), params: { hora_apertura: "18:00", hora_cierre: "09:00" }, as: :json

    assert_response :unprocessable_content
  end

  test "un administrador no puede editar el espacio de otro" do
    sign_in_as(@admin)

    patch espacio_path(@ajeno), params: { estado: "inactivo" }, as: :json

    assert_response :forbidden
    assert_equal "activo", @ajeno.reload.estado
  end

  test "un administrador no puede mover su espacio a la sede de otro" do
    sign_in_as(@admin)

    patch espacio_path(@espacio), params: { sede_id: sedes(:two).id }, as: :json

    assert_response :forbidden
    assert_equal sedes(:one).id, @espacio.reload.sede_id
  end

  test "un usuario no puede editar espacios" do
    sign_in_as(@usuario)

    patch espacio_path(@espacio), params: { estado: "inactivo" }, as: :json

    assert_response :forbidden
  end

  test "un administrador no puede borrar un espacio con reservas" do
    sign_in_as(@admin)

    assert_no_difference "Espacio.count" do
      delete espacio_path(@espacio)
    end

    assert_response :unprocessable_content
  end

  private

  def datos_espacio(extra = {})
    { nombre: "Sala Nueva", tipo: "sala_reunion", capacidad: 6, estado: "activo", sede_id: sedes(:one).id, hora_apertura: "09:00", hora_cierre: "18:00" }.merge(extra)
  end
end
