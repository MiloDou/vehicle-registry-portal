
CREATE TABLE Propietario(
    nit VARCHAR(15) PRIMARY KEY,
    tipo_contribuyente VARCHAR(100) NOT NULL,
    nombre_razon_social VARCHAR(255) NOT NULL,
    cui VARCHAR(13) UNIQUE NULL,
    nombre_representante VARCHAR(255) NULL,
    direccion VARCHAR(255) NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(100) NULL
);

CREATE TABLE Marca(
    id_marca SERIAL PRIMARY KEY,
    nombre_marca VARCHAR(100) NOT NULL
);

CREATE TABLE Linea_vehiculo(
    id_linea SERIAL PRIMARY KEY,
    nombre_linea VARCHAR(100) NOT NULL,
    id_marca INT NOT NULL,
    FOREIGN KEY(id_marca) REFERENCES Marca(id_marca)
);

CREATE TABLE Color(
    id_color SERIAL PRIMARY KEY,
    nombre_color VARCHAR(50) NOT NULL
);

CREATE TABLE Uso(
    id_uso SERIAL PRIMARY KEY,
    descripcion_de_uso VARCHAR(100) NOT NULL
);

CREATE TABLE Tipo(
    id_tipo SERIAL PRIMARY KEY,
    descripcion_de_tipo VARCHAR(100) NOT NULL
);

CREATE TABLE Vehiculo(
    -- EL CÓDIGO ÚNICO SE INGRESA MANUALMENTE
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
    toneladas DECIMAL(5,2),
    id_color INT NOT NULL,
    id_uso INT NOT NULL,
    id_tipo INT NOT NULL,
    id_linea INT NOT NULL,
    FOREIGN KEY (id_color) REFERENCES Color(id_color),
    FOREIGN KEY (id_uso) REFERENCES Uso(id_uso),
    FOREIGN KEY (id_tipo) REFERENCES Tipo(id_tipo),
    FOREIGN KEY (id_linea) REFERENCES Linea_vehiculo(id_linea)
);

CREATE TABLE Tarjeta_de_circulacion(
    codigo_unico_de_tarjeta_de_circulacion VARCHAR(20) PRIMARY KEY,
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
('Tractor Agrícola');

INSERT INTO Uso (descripcion_de_uso) VALUES
('Particular'),
('Comercial'),
('Alquiler'),
('Misión Internacional / Diplomático'),
('Oficial / Gobierno'),
('Urbano'),
('Extraurbano'),
('Agrícola / Industrial');

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
('Gris / Policromado');

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
('Yamaha');

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
('FZ16', 16), ('YBR125', 16), ('MT-03', 16);