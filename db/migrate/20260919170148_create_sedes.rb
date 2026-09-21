class CreateSedes < ActiveRecord::Migration[8.1]
  def change
    create_table :sedes do |t|
      t.string :nombre
      t.string :direccion

      t.timestamps
    end
  end
end
