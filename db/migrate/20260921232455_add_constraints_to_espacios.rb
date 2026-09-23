class AddConstraintsToEspacios < ActiveRecord::Migration[8.1]
  def change
    change_column_null :espacios, :nombre, false
    change_column_default :espacios, :estado, from: nil, to: "activo"
    add_check_constraint :espacios, "capacidad > 0", name: "capacidad_positiva"
  end
end
