
CREATE TABLE IF NOT EXISTS Propietario(
    nit VARCHAR(15) PRIMARY KEY,
    tipo_contribuyente VARCHAR(100) NOT NULL,
    nombre_razon_social VARCHAR(255) NOT NULL,
    cui VARCHAR(13) UNIQUE,
    nombre_representante VARCHAR(255) NULL,
    direccion VARCHAR(255) NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(100) NULL
);

CREATE TABLE IF NOT EXISTS Marca(
    id_marca SERIAL PRIMARY KEY,
    nombre_marca VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Linea_vehiculo(
    id_linea SERIAL PRIMARY KEY,
    nombre_linea VARCHAR(100) NOT NULL,
    id_marca INT NOT NULL,
    FOREIGN KEY(id_marca) REFERENCES Marca(id_marca),
    UNIQUE(nombre_linea, id_marca)
);

CREATE TABLE IF NOT EXISTS Color(
    id_color SERIAL PRIMARY KEY,
    nombre_color VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Uso(
    id_uso SERIAL PRIMARY KEY,
    descripcion_de_uso VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Tipo(
    id_tipo SERIAL PRIMARY KEY,
    descripcion_de_tipo VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Vehiculo(
    codigo_unico_vehiculo INT PRIMARY KEY,
    placa_vehiculo VARCHAR(10) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    serie VARCHAR(50),
    motor VARCHAR(50),
    asientos INT,
    cilindros INT,
    cc INT,
    modelo INT,
    ejes INT,
    toneladas DECIMAL(7,2),
    id_color INT NOT NULL,
    id_uso INT NOT NULL,
    id_tipo INT NOT NULL,
    id_linea INT NOT NULL,
    FOREIGN KEY (id_color) REFERENCES Color(id_color),
    FOREIGN KEY (id_uso) REFERENCES Uso(id_uso),
    FOREIGN KEY (id_tipo) REFERENCES Tipo(id_tipo),
    FOREIGN KEY (id_linea) REFERENCES Linea_vehiculo(id_linea)
);

CREATE TABLE IF NOT EXISTS Tarjeta_de_circulacion(
    codigo_unico_de_tarjeta_de_circulacion VARCHAR(50) PRIMARY KEY,
    prefijo_formulario VARCHAR(12) NOT NULL,
    fecha_de_impresion DATE,
    fecha_de_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_de_vencimiento DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVA',
    codigo_unico_vehiculo INT NOT NULL,
    nit VARCHAR(15) NOT NULL,
    FOREIGN KEY (codigo_unico_vehiculo) REFERENCES Vehiculo(codigo_unico_vehiculo),
    FOREIGN KEY (nit) REFERENCES Propietario(nit)
);

INSERT INTO Tipo (descripcion_de_tipo) VALUES
('Automóvil'),
('Camioneta / SUV'),
('Pick-Up'),
('Camión'),
('Microbús'),
('Autobús'),
('Panel'),
('Motocicleta'),
('Cabezal'),
('Remolque / Furgón'),
('Tractor Agrícola')
ON CONFLICT (descripcion_de_tipo) DO NOTHING;

INSERT INTO Uso (descripcion_de_uso) VALUES
('Particular'),
('Comercial'),
('Alquiler'),
('Misión Internacional / Diplomático'),
('Oficial / Gobierno'),
('Urbano'),
('Extraurbano'),
('Agrícola / Industrial')
ON CONFLICT (descripcion_de_uso) DO NOTHING;

INSERT INTO Color (nombre_color) VALUES
('Blanco'),
('Negro'),
('Gris'),
('Plata'),
('Rojo'),
('Azul'),
('Verde'),
('Amarillo'),
('Beige'),
('Corinto'),
('Café'),
('Blanco / Policromado'),
('Gris / Policromado')
ON CONFLICT (nombre_color) DO NOTHING;

INSERT INTO Marca (nombre_marca) VALUES
('Toyota'),
('Honda'),
('Nissan'),
('Mazda'),
('Suzuki'),
('Mitsubishi'),
('Hyundai'),
('Kia'),
('Ford'),
('Chevrolet'),
('Volkswagen'),
('BMW'),
('Isuzu'),
('Hino'),
('Freightliner'),
('Yamaha')
ON CONFLICT (nombre_marca) DO NOTHING;

INSERT INTO Linea_vehiculo (nombre_linea, id_marca) VALUES
('Yaris', 1), ('Corolla', 1), ('Hilux', 1), ('RAV4', 1), ('Fortuner', 1), ('Tacoma', 1), ('Land Cruiser', 1), ('Hiace', 1),
('Civic', 2), ('Accord', 2), ('CR-V', 2), ('HR-V', 2), ('Fit', 2),
('Sentra', 3), ('Versa', 3), ('Frontier', 3), ('Kicks', 3), ('Navara', 3), ('X-Trail', 3),
('Mazda3', 4), ('Mazda2', 4), ('CX-5', 4), ('BT-50', 4),
('Swift', 5), ('Vitara', 5), ('Jimny', 5), ('Alto', 5),
('L200', 6), ('Mirage', 6), ('Montero', 6), ('Outlander', 6),
('Elantra', 7), ('Tucson', 7), ('Accent', 7), ('Santa Fe', 7), ('H1', 7),
('Picanto', 8), ('Rio', 8), ('Sportage', 8), ('Sorento', 8), ('K2700', 8),
('Ranger', 9), ('Explorer', 9), ('Escape', 9), ('Mustang', 9), ('F-150', 9),
('Spark', 10), ('Aveo', 10), ('Colorado', 10), ('Tracker', 10), ('Silverado', 10),
('Jetta', 11), ('Golf', 11), ('Amarok', 11), ('Polo', 11),
('Serie 3', 12), ('X5', 12),
('D-Max', 13), ('NQR', 13),
('Serie 300', 14), ('Serie 500', 14),
('M2 106', 15), ('Cascadia', 15),
('FZ16', 16), ('YBR125', 16), ('MT-03', 16)
ON CONFLICT (nombre_linea, id_marca) DO NOTHING;
INSERT INTO Propietario (nit, tipo_contribuyente, nombre_razon_social, cui, nombre_representante, direccion, telefono, correo)
VALUES
('12345678-9', 'Individual', 'Juan Perez', '1234567890123', NULL, 'Zona 10, Ciudad', '55541234', 'juan.perez@example.com')
ON CONFLICT (nit) DO NOTHING;

INSERT INTO Vehiculo (codigo_unico_vehiculo, placa_vehiculo, vin, serie, motor, asientos, cilindros, cc, modelo, ejes, toneladas, id_color, id_uso, id_tipo, id_linea)
VALUES
(10000001, 'P123ABC', '1HGCM82633A004352', 'SN123456', 'MO123456', 5, 4, 2000, 2024, 2, 1.50, 1, 1, 1, 1)
ON CONFLICT (codigo_unico_vehiculo) DO NOTHING;

INSERT INTO Tarjeta_de_circulacion (codigo_unico_de_tarjeta_de_circulacion, prefijo_formulario, fecha_de_impresion, fecha_de_vencimiento, estado, codigo_unico_vehiculo, nit)
VALUES
('TC-2025-0001', 'TC-2025', '2025-01-01', '2026-01-01', 'ACTIVA', 10000001, '12345678-9')
ON CONFLICT (codigo_unico_de_tarjeta_de_circulacion) DO NOTHING;

INSERT INTO Propietario (nit, tipo_contribuyente, nombre_razon_social, cui, nombre_representante, direccion, telefono, correo) VALUES 
('11223344-5', 'Individual', 'Carlos Eduardo Mérida González', '2548123450901', NULL, 'Condado Santa María, Quetzaltenango', '55443322', 'cmerida@yahoo.com'),
('8765432-1', 'Empresa', 'Finca El Cafetal, S.A.', '2345678900901', 'Juan Carlos Pérez', 'Zona 3, Quetzaltenango', '77612345', 'admin@fincaelcafetal.com.gt'),
('987654-K', 'Individual', 'María Fernanda López Morales', '1928374650101', NULL, 'Zona 10, Ciudad de Guatemala', '45678901', 'mafer.lopez@gmail.com'),
('5544332-9', 'Empresa', 'Transportes del Occidente, S.A.', '1122334450901', 'Roberto Gómez', 'Autopista Los Altos, Zona 6, Quetzaltenango', '77654321', 'logistica@transocci.com.gt'),
('345678-2', 'Individual', 'Ana Lucía Castillo', '2899555550115', NULL, 'Zona 14, Ciudad de Guatemala', '32109876', 'alucia.castillo@outlook.com'),
('1098765-4', 'Individual', 'Luis Pedro Mazariegos', '2600123450901', NULL, 'La Esperanza, Quetzaltenango', '44332211', 'luis.maza@hotmail.com'),
('9988776-5', 'Empresa', 'Distribuidora Los Altos, S.A.', '1500987650101', 'Silvia de León', 'Avenida Las Américas, Zona 9, Xela', '77665544', 'gerencia@distlosaltos.com.gt'),
('2233445-8', 'Individual', 'Jorge Mario Soto', '1788234560101', NULL, 'Zona 1, Olintepeque', '55667788', 'jmsoto@gmail.com'),
('6655443-3', 'Empresa', 'Agropecuaria La Cima', '2900345670901', 'Marcos Toledo', 'San Juan Ostuncalco, Quetzaltenango', '77889900', 'info@lacimaagro.gt'),
('1122112-2', 'Individual', 'Carmen Julia Reyes', '1999888770101', NULL, 'Zona 4, La Esperanza', '44556677', 'creyes@yahoo.es');

INSERT INTO Vehiculo (codigo_unico_vehiculo, placa_vehiculo, vin, serie, motor, asientos, cilindros, cc, modelo, ejes, toneladas, id_color, id_uso, id_tipo, id_linea) VALUES 
(205401, 'P-111ABC', '8TDJB82X47A000001', 'LN166-00451', '3L-9876541', 5, 4, 2800, 2018, 2, 1.5, 1, 1, 3, 3),
(205402, 'P-222DEF', '1HGCM82633A000002', 'CM8-55432', 'R18Z1-12342', 5, 4, 1800, 2021, 2, 0.0, 5, 1, 1, 9),
(205403, 'P-333GHI', 'KNDJM72345A000003', 'JM7-99883', 'G4NA-887763', 7, 4, 2000, 2023, 2, 0.5, 2, 1, 2, 40),
(205404, 'C-444JKL', '1FUJSDC234A000004', 'SDC-11224', 'ISX15-44334', 3, 6, 12000, 2015, 3, 12.5, 6, 2, 4, 61),
(205405, 'P-555MNO', 'WBAJB12345A000005', 'JB1-77665', 'B48-112235', 5, 4, 2000, 2024, 2, 0.0, 3, 1, 1, 55),
(205406, 'P-666PQR', 'JTDKT02V540000006', 'YRS-44556', '1NZ-FE12346', 5, 4, 1500, 2019, 2, 0.0, 4, 1, 1, 1),
(205407, 'C-777STU', 'JHLRD12345A000007', 'NQR-99887', '4HK1-TC5567', 3, 4, 5200, 2020, 2, 5.0, 1, 2, 4, 58),
(205408, 'M-888VWX', 'ME1MT03234A000008', 'MT-11228', '2CYL-321CC8', 2, 2, 321, 2022, 2, 0.0, 2, 1, 8, 65),
(205409, 'P-999YZA', '3MZBM12345A000009', 'CX5-44559', 'SKY-G20009', 5, 4, 2000, 2022, 2, 0.0, 10, 1, 2, 22),
(205410, 'C-101BCD', 'JTEHT02V540000010', 'HIA-99810', '2KD-FTV4510', 15, 4, 2500, 2017, 2, 1.0, 1, 6, 5, 8);

INSERT INTO Tarjeta_de_circulacion (codigo_unico_de_tarjeta_de_circulacion, prefijo_formulario, fecha_de_impresion, fecha_de_vencimiento, estado, codigo_unico_vehiculo, nit) VALUES 
('TC-2024-000012', 'SAT-4001', '2024-01-15', '2026-07-31', 'ACTIVA', 205401, '8765432-1'),
('TC-2024-000002', 'SAT-4001', '2024-02-10', '2026-07-31', 'ACTIVA', 205402, '987654-K'),
('TC-2024-000003', 'SAT-4001', '2024-03-05', '2026-07-31', 'ACTIVA', 205403, '11223344-5'),
('TC-2024-000004', 'SAT-4001', '2024-04-20', '2026-07-31', 'ACTIVA', 205404, '5544332-9'),
('TC-2024-000005', 'SAT-4001', '2024-05-12', '2026-07-31', 'ACTIVA', 205405, '345678-2'),
('TC-2024-000006', 'SAT-4001', '2024-06-18', '2026-07-31', 'ACTIVA', 205406, '1098765-4'),
('TC-2024-000007', 'SAT-4001', '2024-07-22', '2026-07-31', 'ACTIVA', 205407, '9988776-5'),
('TC-2024-000008', 'SAT-4001', '2024-08-30', '2026-07-31', 'ACTIVA', 205408, '2233445-8'),
('TC-2024-000009', 'SAT-4001', '2024-09-14', '2026-07-31', 'ACTIVA', 205409, '1122112-2'),
('TC-2024-000010', 'SAT-4001', '2024-10-01', '2026-07-31', 'ACTIVA', 205410, '6655443-3');

SELECT nit,nombre_razon_social,telefono
FROM Propietario
WHERE tipo_contribuyente = 'Empresa'
ORDER BY nombre_razon_social ASC;

SELECT c.placa_vehiculo, c.vin, d.nombre_color
FROM Vehiculo c
INNER JOIN Color d
ON c.id_color = d.id_color
WHERE d.nombre_color = 'Blanco';

SELECT c.nombre_marca, COUNT(v.codigo_unico_vehiculo) as total_vehiculos
FROM Marca c
INNER JOIN Linea_vehiculo l
    ON c.id_marca = l.id_marca
INNER JOIN Vehiculo v
    ON l.id_linea = v.id_linea
GROUP BY c.nombre_marca;

SELECT c.codigo_unico_de_tarjeta_de_circulacion, p.placa_vehiculo, c.fecha_de_vencimiento
FROM Tarjeta_de_circulacion c
INNER JOIN Vehiculo p
ON c.codigo_unico_vehiculo = p.codigo_unico_vehiculo
WHERE c.fecha_de_vencimiento > '01/01/2026';


SELECT l.nombre_linea , v.id_linea, m.id_marca, t.codigo_unico_vehiculo
FROM Linea_vehiculo l
INNER JOIN Vehiculo v
ON l.id_linea = v.id_linea
INNER JOIN Marca m
ON l.id_marca = m.id_marca
INNER JOIN Tarjeta_de_circulacion t
ON v.codigo_unico_vehiculo = t.codigo_unico_vehiculo
INNER JOIN Uso u
ON v.id_uso = u.id_uso
WHERE U.descripcion_de_uso = 'Comercial'
;

