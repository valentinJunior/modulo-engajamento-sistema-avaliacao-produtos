-- Dados de desenvolvimento (aplicados por `bun run db:reset`; nunca em produção)

-- Conta de teste: teste@exemplo.com / senha12345
insert into public.accounts (id, first_name, last_name, email, password, salt) values
  ('seed-account-01', 'Teste', 'Exemplo', 'teste@exemplo.com',
   '$2b$12$TAFVdpgqvzldniOV1r3xg.uQCMOEI1/VNikSlvBZAv1cWgvH8dOm6',
   '$2b$12$TAFVdpgqvzldniOV1r3xg.');

-- Produtos de exemplo (24, para testar a rolagem infinita)
insert into public.products (id, name, description, image_url, external_link, created_at) values
  ('seed-product-01', 'Fone de ouvido sem fio', 'Cancelamento de ruído e até 30 horas de bateria.', 'https://picsum.photos/seed/seed-product-01/800/600', 'https://example.com/produtos/seed-product-01', now() - interval '0 hours'),
  ('seed-product-02', 'Cafeteira italiana', 'Alumínio, 6 xícaras, para fogão a gás e elétrico.', 'https://picsum.photos/seed/seed-product-02/800/600', 'https://example.com/produtos/seed-product-02', now() - interval '1 hours'),
  ('seed-product-03', 'Mochila para notebook', 'Compartimento acolchoado para telas de até 15,6".', 'https://picsum.photos/seed/seed-product-03/800/600', 'https://example.com/produtos/seed-product-03', now() - interval '2 hours'),
  ('seed-product-04', 'Garrafa térmica 1 L', 'Mantém a bebida gelada por 24 horas.', 'https://picsum.photos/seed/seed-product-04/800/600', 'https://example.com/produtos/seed-product-04', now() - interval '3 hours'),
  ('seed-product-05', 'Teclado mecânico compacto', 'Layout 75%, switches táteis e conexão USB-C.', 'https://picsum.photos/seed/seed-product-05/800/600', 'https://example.com/produtos/seed-product-05', now() - interval '4 hours'),
  ('seed-product-06', 'Luminária de mesa', 'Luz quente e fria com três níveis de intensidade.', 'https://picsum.photos/seed/seed-product-06/800/600', 'https://example.com/produtos/seed-product-06', now() - interval '5 hours'),
  ('seed-product-07', 'Tênis de corrida', 'Amortecimento leve para treinos de até 10 km.', 'https://picsum.photos/seed/seed-product-07/800/600', 'https://example.com/produtos/seed-product-07', now() - interval '6 hours'),
  ('seed-product-08', 'Panela de ferro', 'Fundida, 24 cm, vai do fogão ao forno.', 'https://picsum.photos/seed/seed-product-08/800/600', 'https://example.com/produtos/seed-product-08', now() - interval '7 hours'),
  ('seed-product-09', 'Cadeira de escritório', 'Apoio lombar ajustável e braços reguláveis.', 'https://picsum.photos/seed/seed-product-09/800/600', 'https://example.com/produtos/seed-product-09', now() - interval '8 hours'),
  ('seed-product-10', 'Relógio esportivo', 'GPS, monitor cardíaco e resistência à água.', 'https://picsum.photos/seed/seed-product-10/800/600', 'https://example.com/produtos/seed-product-10', now() - interval '9 hours'),
  ('seed-product-11', 'Caixa de som portátil', 'À prova d''água, 12 horas de reprodução.', 'https://picsum.photos/seed/seed-product-11/800/600', 'https://example.com/produtos/seed-product-11', now() - interval '10 hours'),
  ('seed-product-12', 'Mouse sem fio', 'Silencioso, com sensor de 4000 DPI.', 'https://picsum.photos/seed/seed-product-12/800/600', 'https://example.com/produtos/seed-product-12', now() - interval '11 hours'),
  ('seed-product-13', 'Kindle', 'Tela sem reflexo de 6" e luz embutida.', 'https://picsum.photos/seed/seed-product-13/800/600', 'https://example.com/produtos/seed-product-13', now() - interval '12 hours'),
  ('seed-product-14', 'Liquidificador', '1200 W, jarra de vidro de 2 litros.', 'https://picsum.photos/seed/seed-product-14/800/600', 'https://example.com/produtos/seed-product-14', now() - interval '13 hours'),
  ('seed-product-15', 'Toalha de banho', '100% algodão, 500 g/m².', 'https://picsum.photos/seed/seed-product-15/800/600', 'https://example.com/produtos/seed-product-15', now() - interval '14 hours'),
  ('seed-product-16', 'Carregador portátil', '10.000 mAh com carga rápida.', 'https://picsum.photos/seed/seed-product-16/800/600', 'https://example.com/produtos/seed-product-16', now() - interval '15 hours'),
  ('seed-product-17', 'Filtro de água de barro', 'Três velas, 6 litros.', 'https://picsum.photos/seed/seed-product-17/800/600', 'https://example.com/produtos/seed-product-17', now() - interval '16 hours'),
  ('seed-product-18', 'Jogo de facas', 'Aço inox, cinco peças com suporte de madeira.', 'https://picsum.photos/seed/seed-product-18/800/600', 'https://example.com/produtos/seed-product-18', now() - interval '17 hours'),
  ('seed-product-19', 'Câmera instantânea', 'Fotos impressas na hora, flash automático.', 'https://picsum.photos/seed/seed-product-19/800/600', 'https://example.com/produtos/seed-product-19', now() - interval '18 hours'),
  ('seed-product-20', 'Bicicleta dobrável', 'Aro 20, sete marchas, quadro de alumínio.', 'https://picsum.photos/seed/seed-product-20/800/600', 'https://example.com/produtos/seed-product-20', now() - interval '19 hours'),
  ('seed-product-21', 'Tapete de yoga', 'Antiderrapante, 6 mm de espessura.', 'https://picsum.photos/seed/seed-product-21/800/600', 'https://example.com/produtos/seed-product-21', now() - interval '20 hours'),
  ('seed-product-22', 'Ventilador de mesa', 'Três velocidades e oscilação silenciosa.', 'https://picsum.photos/seed/seed-product-22/800/600', 'https://example.com/produtos/seed-product-22', now() - interval '21 hours'),
  ('seed-product-23', 'Air fryer', '4 litros, timer de 60 minutos.', 'https://picsum.photos/seed/seed-product-23/800/600', 'https://example.com/produtos/seed-product-23', now() - interval '22 hours'),
  ('seed-product-24', 'Monitor 27"', 'Resolução QHD, 75 Hz, ajuste de altura.', 'https://picsum.photos/seed/seed-product-24/800/600', 'https://example.com/produtos/seed-product-24', now() - interval '23 hours');
