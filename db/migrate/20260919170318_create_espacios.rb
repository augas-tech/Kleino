class CreateEspacios < ActiveRecord::Migration[8.1]
  def change
    create_table :espacios do |t|
      t.string :nombre
      t.string :tipo
      t.integer :capacidad
      t.string :ubicacion
      t.text :descripcion
      t.string :estado
      t.references :sede, null: false, foreign_key: true

      t.timestamps
    end
  end
end
