class AddConstraintsToSedes < ActiveRecord::Migration[8.1]
  def change
    change_column_null :sedes, :nombre, false
  end
end
