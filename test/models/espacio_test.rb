require "test_helper"

class EspacioTest < ActiveSupport::TestCase
  test "el horario requiere apertura y cierre juntos" do
    espacio = espacios(:one)
    espacio.hora_cierre = nil

    assert_not espacio.valid?
  end

  test "el cierre debe ser posterior a la apertura" do
    espacio = espacios(:one)
    espacio.assign_attributes(hora_apertura: "18:00", hora_cierre: "09:00")

    assert_not espacio.valid?
    assert espacio.errors[:hora_cierre].any?
  end

  test "un espacio sin horario está disponible todo el día" do
    espacio = espacios(:two)

    assert_not espacio.horario_definido?
    assert espacio.abierto_entre?(Time.utc(2000, 1, 1, 0, 0), Time.utc(2000, 1, 1, 23, 0))
  end
end
