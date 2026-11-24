class Reserva < ApplicationRecord
  ESTADOS = %w[pendiente aprobada rechazada cancelada completada].freeze
  # Una reserva en estos estados ya no ocupa el horario del espacio.
  ESTADOS_SIN_CUPO = %w[rechazada cancelada].freeze

  belongs_to :user
  belongs_to :espacio

  validates :fecha, :hora_inicio, :hora_fin, presence: true
  validates :estado, inclusion: { in: ESTADOS }
  validate :fecha_no_en_el_pasado
  validate :hora_fin_posterior_a_inicio
  validate :espacio_habilitado
  validate :dentro_del_horario_del_espacio
  validate :sin_solapamiento

  def ocupa_cupo?
    !ESTADOS_SIN_CUPO.include?(estado)
  end

  private

  def agenda_modificada?
    new_record? || will_save_change_to_hora_inicio? || will_save_change_to_hora_fin? || will_save_change_to_espacio_id?
  end

  # Solo valida la fecha si es nueva o cambió: así se puede cancelar una reserva antigua.
  def fecha_no_en_el_pasado
    return if fecha.blank?
    return unless new_record? || will_save_change_to_fecha?

    errors.add(:fecha, "no puede ser en el pasado") if fecha < Date.current
  end

  def hora_fin_posterior_a_inicio
    return if hora_inicio.blank? || hora_fin.blank?
    errors.add(:hora_fin, "debe ser posterior a hora_inicio") if hora_fin <= hora_inicio
  end

  def espacio_habilitado
    return if espacio.blank?
    return unless new_record? || will_save_change_to_espacio_id?

    errors.add(:espacio, "no está habilitado para reservas") unless espacio.activo?
  end

  def dentro_del_horario_del_espacio
    return if espacio.blank? || hora_inicio.blank? || hora_fin.blank?
    return unless agenda_modificada?
    return if espacio.abierto_entre?(hora_inicio, hora_fin)

    errors.add(:base, "el espacio solo atiende entre #{espacio.horario_texto}")
  end

  def sin_solapamiento
    return unless ocupa_cupo?
    return if espacio_id.blank? || fecha.blank? || hora_inicio.blank? || hora_fin.blank?

    conflicto = Reserva.where(espacio_id: espacio_id, fecha: fecha)
                        .where.not(id: id)
                        .where.not(estado: ESTADOS_SIN_CUPO)
                        .where("hora_inicio < ? AND hora_fin > ?", hora_fin, hora_inicio)
                        .exists?

    errors.add(:base, "el espacio ya está reservado en ese horario") if conflicto
  end
end
