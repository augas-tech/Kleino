class Reserva < ApplicationRecord
  ESTADOS = %w[pendiente aprobada rechazada cancelada completada].freeze

  belongs_to :user
  belongs_to :espacio

  validates :fecha, :hora_inicio, :hora_fin, presence: true
  validates :estado, inclusion: { in: ESTADOS }
  validate :fecha_no_en_el_pasado
  validate :hora_fin_posterior_a_inicio
  validate :sin_solapamiento

  private

  def fecha_no_en_el_pasado
    return if fecha.blank?
    errors.add(:fecha, "no puede ser en el pasado") if fecha < Date.current
  end

  def hora_fin_posterior_a_inicio
    return if hora_inicio.blank? || hora_fin.blank?
    errors.add(:hora_fin, "debe ser posterior a hora_inicio") if hora_fin <= hora_inicio
  end

  def sin_solapamiento
    return if espacio_id.blank? || fecha.blank? || hora_inicio.blank? || hora_fin.blank?

    conflicto = Reserva.where(espacio_id: espacio_id, fecha: fecha)
                        .where.not(id: id)
                        .where("hora_inicio < ? AND hora_fin > ?", hora_fin, hora_inicio)
                        .exists?

    errors.add(:base, "el espacio ya está reservado en ese horario") if conflicto
  end
end
