export type Departamento = {
  nombre: string;
  municipios: string[];
};

export const departamentosConMunicipios: Departamento[] = [
  {
    nombre: "Alta Verapaz",
    municipios: [
      "Cobán", "Santa Cruz Verapaz", "San Cristóbal Verapaz", "Tactic", "Tamahú", "San Miguel Tucurú",
      "Panzós", "Senahú", "San Pedro Carchá", "San Juan Chamelco", "Lanquín", "Cahabón", "Chisec",
      "Chahal", "Fray Bartolomé de las Casas", "Santa Catalina La Tinta", "Raxruhá"
    ]
  },
  {
    nombre: "Baja Verapaz",
    municipios: [
      "Salamá", "San Miguel Chicaj", "Rabinal", "Cubulco", "Granados", "Santa Cruz El Chol",
      "San Jerónimo", "Purulhá"
    ]
  },
  {
    nombre: "Chimaltenango",
    municipios: [
      "Chimaltenango", "San José Poaquil", "San Martín Jilotepeque", "Comalapa", "Santa Apolonia",
      "Tecpán Guatemala", "Patzún", "Pochuta", "Patzicía", "Santa Cruz Balanyá", "Acatenango",
      "Yepocapa", "San Andrés Itzapa", "Parramos", "Zaragoza", "El Tejar"
    ]
  },
  {
    nombre: "Chiquimula",
    municipios: [
      "Chiquimula", "San José La Arada", "San Juan Ermita", "Jocotán", "Camotán", "Olopa",
      "Esquipulas", "Concepción Las Minas", "Quezaltepeque"
    ]
  },
  {
    nombre: "El Progreso",
    municipios: [
      "Guastatoya", "Morazán", "San Agustín Acasaguastlán", "San Cristóbal Acasaguastlán",
      "El Jícaro", "Sansare", "Sanarate", "San Antonio La Paz"
    ]
  },
  {
    nombre: "Escuintla",
    municipios: [
      "Escuintla", "Santa Lucía Cotzumalguapa", "La Democracia", "Siquinalá", "Masagua", "Tiquisate",
      "La Gomera", "Guanagazapa", "San José", "Iztapa", "Palín", "San Vicente Pacaya", "Nueva Concepción"
    ]
  },
  {
    nombre: "Guatemala",
    municipios: [
      "Guatemala", "Santa Catarina Pinula", "San José Pinula", "San José del Golfo", "Palencia",
      "Chinautla", "San Pedro Ayampuc", "Mixco", "San Pedro Sacatepéquez", "San Juan Sacatepéquez",
      "San Raymundo", "Chuarrancho", "Fraijanes", "Amatitlán", "Villa Nueva", "Villa Canales", "Petapa"
    ]
  },
  {
    nombre: "Huehuetenango",
    municipios: [
      "Huehuetenango", "Chiantla", "Malacatancito", "Cuilco", "Nentón", "San Pedro Necta",
      "Jacaltenango", "San Pedro Soloma", "Santa Eulalia", "San Mateo Ixtatán", "Colotenango",
      "San Sebastián Huehuetenango", "Tectitán", "Concepción Huista", "San Juan Ixcoy", "La Democracia",
      "San Rafael Petzal", "San Gaspar Ixchil", "Santiago Chimaltenango", "Santa Bárbara", "Aguacatán",
      "San Juan Atitán", "Santa Ana Huista", "Unión Cantinil"
    ]
  },
  {
    nombre: "Izabal",
    municipios: [
      "Puerto Barrios", "Livingston", "El Estor", "Morales", "Los Amates"
    ]
  },
  {
    nombre: "Jalapa",
    municipios: [
      "Jalapa", "San Pedro Pinula", "San Luis Jilotepeque", "San Manuel Chaparrón",
      "San Carlos Alzatate", "Monjas", "Mataquescuintla"
    ]
  },
  {
    nombre: "Jutiapa",
    municipios: [
      "Jutiapa", "El Progreso", "Santa Catarina Mita", "Agua Blanca", "Asunción Mita", "Yupiltepeque",
      "Atescatempa", "Jerez", "El Adelanto", "Zapotitlán", "Comapa", "Jalpatagua", "Conguaco",
      "Moyuta", "Pasaco", "Quesada"
    ]
  },
  {
    nombre: "Petén",
    municipios: [
      "Flores", "San Benito", "San Andrés", "La Libertad", "San Francisco", "Santa Ana", "Dolores",
      "San Luis", "Sayaxché", "Melchor de Mencos", "Poptún", "Las Cruces", "El Chal"
    ]
  },
  {
    nombre: "Quetzaltenango",
    municipios: [
      "Quetzaltenango", "Salcajá", "Olintepeque", "San Carlos Sija", "Sibilia", "Cabricán",
      "Cajolá", "San Miguel Sigüilá", "Ostuncalco", "San Mateo", "Concepción Chiquirichapa",
      "San Martín Sacatepéquez", "Almolonga", "Cantel", "Huitán", "Zunil", "Colomba", "San Francisco La Unión",
      "El Palmar", "Coatepeque", "Génova", "Flores Costa Cuca", "La Esperanza", "Palestina de Los Altos"
    ]
  },
  {
    nombre: "Quiché",
    municipios: [
      "Santa Cruz del Quiché", "Chiché", "Chinique", "Zacualpa", "Chajul", "Chichicastenango",
      "Patzité", "San Antonio Ilotenango", "San Pedro Jocopilas", "Cunén", "San Juan Cotzal",
      "Joyabaj", "Nebaj", "San Andrés Sajcabajá", "Uspantán", "Sacapulas", "San Bartolomé Jocotenango",
      "Canillá", "Chicamán", "Ixcán", "Pachalum"
    ]
  },
  {
    nombre: "Retalhuleu",
    municipios: [
      "Retalhuleu", "San Sebastián", "Santa Cruz Muluá", "San Martín Zapotitlán", "San Felipe",
      "San Andrés Villa Seca", "Champerico", "Nuevo San Carlos", "El Asintal"
    ]
  },
  {
    nombre: "Sacatepéquez",
    municipios: [
      "Antigua Guatemala", "Jocotenango", "Pastores", "Sumpango", "Santo Domingo Xenacoj",
      "Santiago Sacatepéquez", "San Bartolomé Milpas Altas", "San Lucas Sacatepéquez", "Santa Lucía Milpas Altas",
      "Magdalena Milpas Altas", "Santa María de Jesús", "Ciudad Vieja", "San Miguel Dueñas",
      "San Juan Alotenango", "San Antonio Aguas Calientes", "Santa Catarina Barahona"
    ]
  },
  {
    nombre: "San Marcos",
    municipios: [
      "San Marcos", "San Pedro Sacatepéquez", "San Antonio Sacatepéquez", "Comitancillo", "San Miguel Ixtahuacán",
      "Concepción Tutuapa", "Tacaná", "Sibinal", "Tajumulco", "Tejutla", "San Rafael Pie de la Cuesta",
      "Nuevo Progreso", "El Tumbador", "San José El Rodeo", "Malacatán", "Catarina", "Ayutla", "Ocos",
      "San Pablo", "El Quetzal", "La Reforma", "Pajapita", "Ixchiguán", "San José Ojetenam", "San Cristóbal Cucho",
      "Sipacapa", "Esquipulas Palo Gordo", "Río Blanco", "San Lorenzo"
    ]
  },
  {
    nombre: "Santa Rosa",
    municipios: [
      "Cuilapa", "Barberena", "Santa Rosa de Lima", "Casillas", "San Rafael Las Flores", "Oratorio",
      "San Juan Tecuaco", "Chiquimulilla", "Taxisco", "Santa María Ixhuatán", "Guazacapán",
      "Santa Cruz Naranjo", "Pueblo Nuevo Viñas", "Nueva Santa Rosa"
    ]
  },
  {
    nombre: "Sololá",
    municipios: [
      "Sololá", "San José Chacayá", "Santa María Visitación", "Santa Lucía Utatlán", "Nahualá",
      "Santa Catarina Ixtahuacán", "Santa Clara La Laguna", "Concepción", "San Andrés Semetabaj",
      "Panajachel", "Santa Catarina Palopó", "San Antonio Palopó", "San Lucas Tolimán",
      "Santa Cruz La Laguna", "San Pablo La Laguna", "San Marcos La Laguna", "San Juan La Laguna",
      "San Pedro La Laguna", "Santiago Atitlán"
    ]
  },
  {
    nombre: "Suchitepéquez",
    municipios: [
      "Mazatenango", "Cuyotenango", "San Francisco Zapotitlán", "San Bernardino", "San José El Ídolo",
      "Santo Domingo Suchitepéquez", "San Lorenzo", "Samayac", "San Pablo Jocopilas", "San Antonio Suchitepéquez",
      "San Miguel Panán", "San Gabriel", "Chicacao", "Patulul", "Santa Bárbara", "San Juan Bautista",
      "Santo Tomás La Unión", "Zunilito", "Pueblo Nuevo", "Río Bravo"
    ]
  },
  {
    nombre: "Totonicapán",
    municipios: [
      "Totonicapán", "San Cristóbal Totonicapán", "San Francisco El Alto", "San Andrés Xecul",
      "Momostenango", "Santa María Chiquimula", "Santa Lucía La Reforma", "San Bartolo"
    ]
  },
  {
    nombre: "Zacapa",
    municipios: [
      "Zacapa", "Estanzuela", "Río Hondo", "Gualán", "Teculután", "Usumatlán", "Cabañas",
      "San Diego", "La Unión", "Huité"
    ]
  }
];

export function getMunicipiosPorDepartamento(nombre: string): string[] {
  const depto = departamentosConMunicipios.find((d) => d.nombre === nombre);
  return depto ? depto.municipios : [];
}
