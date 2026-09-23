class CreateReservas < ActiveRecord::Migration[8.1]
  def change
    create_table :reservas do |t|
      t.references :user, null: false, foreign_key: true
      t.references :espacio, null: false, foreign_key: true
      t.date :fecha
      t.time :hora_inicio
      t.time :hora_fin
      t.string :estado

      t.timestamps
    end
  end
end
