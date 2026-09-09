-- Rebrand Trevo: repinta as categorias padrão com a paleta nova.
--
-- Só toca em categorias que ainda estão exatamente na cor antiga de fábrica
-- (is_default = 1 + cor original), então qualquer cor escolhida pelo usuário
-- fica preservada.

UPDATE categories SET color = '#2E9D5B' WHERE is_default = 1 AND name = 'Salário'       AND color = '#9be768';
UPDATE categories SET color = '#4FB877' WHERE is_default = 1 AND name = 'Freelance'     AND color = '#b8b8ff';
UPDATE categories SET color = '#7FD199' WHERE is_default = 1 AND name = 'Investimentos' AND color = '#7cd992';
UPDATE categories SET color = '#D9A441' WHERE is_default = 1 AND name = 'Moradia'       AND color = '#ff8a80';
UPDATE categories SET color = '#E4884A' WHERE is_default = 1 AND name = 'Alimentação'   AND color = '#ffd54f';
UPDATE categories SET color = '#C97B9E' WHERE is_default = 1 AND name = 'Mercado'       AND color = '#ffcc80';
UPDATE categories SET color = '#4E8FBF' WHERE is_default = 1 AND name = 'Transporte'    AND color = '#90caf9';
UPDATE categories SET color = '#D1495B' WHERE is_default = 1 AND name = 'Saúde'         AND color = '#ef9a9a';
UPDATE categories SET color = '#8B7BC4' WHERE is_default = 1 AND name = 'Educação'      AND color = '#ce93d8';
UPDATE categories SET color = '#4CA9A0' WHERE is_default = 1 AND name = 'Assinaturas'   AND color = '#80cbc4';
UPDATE categories SET color = '#E0658A' WHERE is_default = 1 AND name = 'Lazer'         AND color = '#f48fb1';
UPDATE categories SET color = '#7A8B99' WHERE is_default = 1 AND name = 'Contas'        AND color = '#b0bec5';
UPDATE categories SET color = '#1F8049' WHERE is_default = 1 AND name = 'Reserva'       AND color = '#aed581';
UPDATE categories SET color = '#B08968' WHERE is_default = 1 AND name = 'Pets'          AND color = '#bcaaa4';
UPDATE categories SET color = '#E07A5F' WHERE is_default = 1 AND name = 'Presentes'     AND color = '#ffab91';
UPDATE categories SET color = '#96A5A0' WHERE is_default = 1 AND name = 'Outros'        AND color = '#cfd8dc';

-- A cor de fábrica de novas categorias também passa a ser o verde do trevo.
ALTER TABLE categories ALTER COLUMN color SET DEFAULT '#2E9D5B';
