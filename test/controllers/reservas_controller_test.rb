require "test_helper"

class ReservasControllerTest < ActionDispatch::IntegrationTest
  setup do
    @usuario = users(:one)
    @otro_usuario = users(:two)
    @admin = users(:admin)
    @reserva = reservas(:one)  # del usuario one, en el espacio del admin
    @ajena = reservas(:two)    # del usuario two, en el espacio de otro_admin
  end

  test "sin sesión responde 401" do
    get reservas_path

    assert_response :unauthorized
  end

  test "un usuario crea una reserva dentro del horario del espacio" do
    sign_in_as(@usuario)

    assert_difference "Reserva.count", 1 do
      post reservas_path, params: datos_reserva, as: :json
    end

    assert_response :created
    assert_equal @usuario.id, response.parsed_body["user_id"]
  end

  test "un administrador no puede crear reservas" do
    sign_in_as(@admin)

    assert_no_difference "Reserva.count" do
      post reservas_path, params: datos_reserva, as: :json
    end

    assert_response :forbidden
  end

  test "no se puede reservar fuera del horario del espacio" do
    sign_in_as(@usuario)

    post reservas_path, params: datos_reserva(hora_inicio: "06:00", hora_fin: "07:00"), as: :json

    assert_response :unprocessable_content
  end

  test "no se puede reservar un espacio inactivo" do
    sign_in_as(@usuario)

    post reservas_path, params: datos_reserva(espacio_id: espacios(:cerrado).id), as: :json

    assert_response :unprocessable_content
  end

  test "un usuario solo ve sus reservas" do
    sign_in_as(@usuario)

    get reservas_path

    ids = response.parsed_body.map { |r| r["id"] }
    assert_includes ids, @reserva.id
    assert_not_includes ids, @ajena.id
  end

  test "un usuario no puede ver la reserva de otro" do
    sign_in_as(@usuario)

    get reserva_path(@ajena)

    assert_response :not_found
  end

  test "un administrador ve las reservas de sus espacios y no las de otros" do
    sign_in_as(@admin)

    get reservas_path

    ids = response.parsed_body.map { |r| r["id"] }
    assert_includes ids, @reserva.id
    assert_not_includes ids, @ajena.id
  end

  test "un administrador cancela una reserva de su espacio" do
    sign_in_as(@admin)

    patch cancelar_reserva_path(@reserva)

    assert_response :success
    assert_equal "cancelada", @reserva.reload.estado
  end

  test "un administrador no puede cancelar reservas de espacios de otro" do
    sign_in_as(@admin)

    patch cancelar_reserva_path(@ajena)

    assert_response :not_found
    assert_equal "pendiente", @ajena.reload.estado
  end

  test "un administrador no puede editar reservas" do
    sign_in_as(@admin)

    patch reserva_path(@reserva), params: { hora_fin: "12:00" }, as: :json

    assert_response :forbidden
  end

  test "un usuario cancela su propia reserva" do
    sign_in_as(@usuario)

    patch cancelar_reserva_path(@reserva)

    assert_response :success
    assert_equal "cancelada", @reserva.reload.estado
  end

  test "un usuario no puede cancelar la reserva de otro" do
    sign_in_as(@usuario)

    patch cancelar_reserva_path(@ajena)

    assert_response :not_found
  end

  test "un usuario edita su propia reserva" do
    sign_in_as(@usuario)

    patch reserva_path(@reserva), params: { hora_fin: "12:00" }, as: :json

    assert_response :success
  end

  private

  def datos_reserva(extra = {})
    { espacio_id: espacios(:one).id, fecha: (Date.current + 14).to_s, hora_inicio: "10:00", hora_fin: "11:00" }.merge(extra)
  end
end
