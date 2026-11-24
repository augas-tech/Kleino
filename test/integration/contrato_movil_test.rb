require "test_helper"

# Reproduce las llamadas que hace la app móvil (mobile/src/api/*) contra la API real.
class ContratoMovilTest < ActionDispatch::IntegrationTest
  MOVIL = { "X-Client" => "mobile" }.freeze

  setup do
    @admin = User.create!(email_address: "admin-movil@example.com", password: "clave12345", rol: "administrador")
    @usuario = User.create!(email_address: "usuario-movil@example.com", password: "clave12345")
    sede = Sede.create!(nombre: "Sede Móvil", propietario: @admin)
    @espacio = Espacio.create!(nombre: "Sala Móvil", capacidad: 4, estado: "activo", sede: sede,
                               hora_apertura: "08:00", hora_cierre: "20:00")
  end

  test "flujo del usuario: login con token, espacios, reservar, cancelar y logout" do
    token = login_movil(@usuario)
    auth = bearer(token)

    get session_path, headers: auth
    assert_response :success
    assert_equal "usuario", response.parsed_body.dig("user", "rol")

    get espacios_path, headers: auth
    assert_response :success
    assert_includes response.parsed_body.map { |e| e["nombre"] }, "Sala Móvil"

    post reservas_path, params: reserva_params, headers: auth, as: :json
    assert_response :created
    reserva_id = response.parsed_body["id"]

    get reservas_path, headers: auth
    assert_response :success
    assert_includes response.parsed_body.map { |r| r["id"] }, reserva_id

    patch cancelar_reserva_path(reserva_id), headers: auth
    assert_response :success
    assert_equal "cancelada", response.parsed_body["estado"]

    delete session_path, headers: auth
    assert_response :no_content

    get session_path, headers: auth
    assert_response :unauthorized
  end

  test "el admin crea un espacio y el usuario recibe 403 con mensaje" do
    datos = { nombre: "Lab Móvil", capacidad: 6, estado: "activo", sede_id: @espacio.sede_id }

    post espacios_path, params: datos, headers: bearer(login_movil(@admin)), as: :json
    assert_response :created

    post espacios_path, params: datos.merge(nombre: "Prohibido"), headers: bearer(login_movil(@usuario)), as: :json
    assert_response :forbidden
    assert response.parsed_body["error"].present?
  end

  test "una reserva solapada responde 422 con la lista de errores" do
    auth = bearer(login_movil(@usuario))

    post reservas_path, params: reserva_params, headers: auth, as: :json
    assert_response :created

    post reservas_path, params: reserva_params(hora_inicio: "10:30", hora_fin: "11:30"), headers: auth, as: :json
    assert_response :unprocessable_content
    assert_kind_of Array, response.parsed_body["errors"]
  end

  test "sin token responde 401" do
    get espacios_path
    assert_response :unauthorized
  end

  private

  def login_movil(user)
    post session_path, params: { email_address: user.email_address, password: "clave12345" }, headers: MOVIL, as: :json
    assert_response :created
    response.parsed_body.fetch("token")
  end

  def bearer(token)
    { "Authorization" => "Bearer #{token}" }
  end

  def reserva_params(extra = {})
    { espacio_id: @espacio.id, fecha: (Date.current + 7).to_s, hora_inicio: "10:00", hora_fin: "11:00" }.merge(extra)
  end
end
