export const GATICO_COLORS = {


    negro:      { hex: 0x2C2C2C, label: "Negro" },
    carbon:     { hex: 0x4A4A4A, label: "Carbón" },
    grafito:    { hex: 0x6B6B6B, label: "Grafito" },
    blanco:     { hex: 0xFFFDF9, label: "Blanco" },
    perla:      { hex: 0xF0EDE8, label: "Perla" },
    gris:       { hex: 0xB0ADA8, label: "Gris" },
    plata:      { hex: 0xD4D0CC, label: "Plata" },
    naranja:    { hex: 0xFFB37C, label: "Naranja" },
    melocoton:  { hex: 0xFFCBA4, label: "Melocotón" },
    canela:     { hex: 0xC8855A, label: "Canela" },
    chocolate:  { hex: 0x7B4F2E, label: "Chocolate" },
    caramelo:   { hex: 0xD4924A, label: "Caramelo" },
    cafe:       { hex: 0x9E6B4A, label: "Café" },
    moca:       { hex: 0xB8825C, label: "Moca" },
    arena:      { hex: 0xE8C99A, label: "Arena" },
    lavanda:    { hex: 0xC4A8E0, label: "Lavanda" },
    lila:       { hex: 0xB088CC, label: "Lila" },
    rosa:       { hex: 0xFFB7C5, label: "Rosa" },
    salmon:     { hex: 0xFFA07A, label: "Salmón" },
    menta:      { hex: 0xA8D8B9, label: "Menta" },
    azulpastel: { hex: 0xA8C8E8, label: "Azul Pastel" },
    cielo:      { hex: 0x87CEEB, label: "Cielo" },
    amarillo:   { hex: 0xF5D76E, label: "Amarillo" },
    crema:      { hex: 0xF5E6C8, label: "Crema" },
    rojizo:     { hex: 0xC05A4A, label: "Rojizo" },
    dorado:     { hex: 0xD4A843, label: "Dorado" }

};


export function getColorHex(colorName) {

    const key = String(colorName)
        .toLowerCase()
        .trim();

    return (
        GATICO_COLORS[key]?.hex
        ?? GATICO_COLORS.naranja.hex
    );
}


export function getColorLabel(colorName) {

    const key = String(colorName)
        .toLowerCase()
        .trim();

    return (
        GATICO_COLORS[key]?.label
        ?? "Naranja"
    );
}