class Reserva < ApplicationRecord
  belongs_to :user
  belongs_to :espacio

  validate :horario_no_solapado

  private

  def horario_no_solapado
    return if espacio_id.blank? || fecha.blank? || hora_inicio.blank? || hora_fin.blank?

    conflictos = Reserva.where(espacio_id: espacio_id, fecha: fecha)
                         .where.not(id: id)
                         .where.not(estado: [ "cancelada", "rechazada" ])
                         .where("hora_inicio < ? AND hora_fin > ?", hora_fin, hora_inicio)

    if conflictos.exists?
      errors.add(:base, "Ya existe una reserva para ese espacio en ese horario")
    end
  end
end