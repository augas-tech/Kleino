class AddPropietarioToSedes < ActiveRecord::Migration[8.1]
  def change
    # Nullable a propósito: las sedes que ya existen en producción no tienen dueño
    # hasta que se corre db:seed (que se lo asigna al administrador).
    add_reference :sedes, :propietario, foreign_key: { to_table: :users }, null: true
  end
end
