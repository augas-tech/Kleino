class AddConstraintsToReservas < ActiveRecord::Migration[8.1]
  def change
    change_column_null :reservas, :fecha, false
    change_column_null :reservas, :hora_inicio, false
    change_column_null :reservas, :hora_fin, false
    change_column_default :reservas, :estado, from: nil, to: "pendiente"
    add_index :reservas, [ :espacio_id, :fecha ]
  end
end
