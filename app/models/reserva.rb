class Reserva < ApplicationRecord
  belongs_to :user
  belongs_to :espacio
end
