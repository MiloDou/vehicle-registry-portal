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
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre_marca VARCHAR(100) NOT NULL
);

CREATE TABLE Linea_vehiculo(
    id_linea INT AUTO_INCREMENT PRIMARY KEY,
    nombre_linea VARCHAR(100) NOT NULL,
    id_marca INT NOT NULL,
    FOREIGN KEY(id_marca) REFERENCES Marca(id_marca)
);

CREATE TABLE Color(
    id_color INT AUTO_INCREMENT PRIMARY KEY,
    nombre_color VARCHAR(50) NOT NULL
);

CREATE TABLE Uso(
    id_uso INT AUTO_INCREMENT PRIMARY KEY,
    descripcion_de_uso VARCHAR(100) NOT NULL
);

CREATE TABLE Tipo(
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    descripcion_de_tipo VARCHAR(100) NOT NULL
);

CREATE TABLE Vehiculo(
    -- EL CÓDIGO ÚNICO DE VEHÍCULO SE INGRESA MANUALMENTE SEGÚN REGISTRO ADUANAL
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
    codigo_unico_vehiculo INT NOT NULL,
    nit VARCHAR(15) NOT NULL,
    FOREIGN KEY (codigo_unico_vehiculo) REFERENCES Vehiculo(codigo_unico_vehiculo),
    FOREIGN KEY (nit) REFERENCES Contribuyente(nit)
);