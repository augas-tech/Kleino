require "test_helper"

class ReservaTest < ActiveSupport::TestCase
  test "una reserva cancelada libera el horario" do
    reserva = reservas(:one)
    nueva = Reserva.new(user: users(:two), espacio: reserva.espacio, fecha: reserva.fecha, hora_inicio: reserva.hora_inicio, hora_fin: reserva.hora_fin)

    assert_not nueva.valid?

    reserva.update!(estado: "cancelada")

    assert nueva.valid?
  end

  test "se puede cancelar una reserva de una fecha que ya pasó" do
    reserva = reservas(:one)
    reserva.update_columns(fecha: Date.current - 3)

    assert reserva.update(estado: "cancelada")
  end

  test "no se puede crear una reserva en una fecha pasada" do
    reserva = Reserva.new(user: users(:one), espacio: espacios(:one), fecha: Date.current - 1, hora_inicio: "10:00", hora_fin: "11:00")

    assert_not reserva.valid?
  end
end
