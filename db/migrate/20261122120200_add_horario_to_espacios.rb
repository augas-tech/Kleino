class AddHorarioToEspacios < ActiveRecord::Migration[8.1]
  def change
    add_column :espacios, :hora_apertura, :time
    add_column :espacios, :hora_cierre, :time
    add_check_constraint :espacios, "(hora_apertura IS NULL AND hora_cierre IS NULL) OR (hora_apertura IS NOT NULL AND hora_cierre IS NOT NULL AND hora_cierre > hora_apertura)", name: "horario_valido"
  end
end
