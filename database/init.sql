CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0)
);

INSERT INTO products (name, description, price_cents) VALUES
  ('Clavier compact', 'Clavier mecanique compact pour developpeur.', 5990),
  ('Souris precision', 'Souris ergonomique pour poste de travail.', 3490),
  ('Ecran 24 pouces', 'Ecran full HD pour environnement bureautique.', 12990)
ON CONFLICT DO NOTHING;

-- Evolution non destructive (v1.1.x) : ajout d'un produit au catalogue.
-- INSERT conditionnel : ne supprime ni ne modifie les produits existants,
-- et reste idempotent si le script est rejoue sur une base deja peuplee.
INSERT INTO products (name, description, price_cents)
SELECT 'Casque audio', 'Casque ferme avec micro pour visioconference.', 7990
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Casque audio');
