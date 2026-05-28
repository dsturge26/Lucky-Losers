export type Length = "short" | "medium" | "long";

export interface Hairstyle {
  id: string;
  name: string;
  description: string;
}

export const HAIRSTYLES: Record<Length, Hairstyle[]> = {
  short: [
    { id: "buzz", name: "Buzz Cut", description: "a very short, uniform buzz cut about a quarter inch all over" },
    { id: "crew", name: "Crew Cut", description: "a classic short crew cut with slightly longer hair on top and tapered sides" },
    { id: "high-fade", name: "High Fade", description: "a high skin fade with short textured hair on top" },
    { id: "low-taper", name: "Low Taper", description: "a low taper haircut with neat short length on top, blending cleanly into the sides" },
    { id: "french-crop", name: "French Crop", description: "a short French crop with a textured fringe falling forward over the forehead and faded sides" },
    { id: "ivy-league", name: "Ivy League", description: "an Ivy League haircut, a short side-parted style with a tidy professional finish" },
    { id: "caesar", name: "Caesar Cut", description: "a short Caesar cut with a straight, blunt fringe across the forehead" },
    { id: "textured-crop", name: "Textured Crop", description: "a short textured crop with messy, choppy layers on top and tight sides" },
    { id: "short-pomp", name: "Short Pompadour", description: "a short modern pompadour with volume swept up and back, and tapered sides" },
  ],
  medium: [
    { id: "side-part", name: "Side Part", description: "a classic medium-length side part, combed neatly to one side" },
    { id: "quiff", name: "Modern Quiff", description: "a medium-length modern quiff with the front swept up and back, voluminous on top" },
    { id: "slick-back", name: "Slick Back", description: "a medium-length slick back, hair combed straight back away from the forehead" },
    { id: "comb-over", name: "Comb Over", description: "a medium-length comb over with a defined parting and hair swept across to one side" },
    { id: "textured-waves", name: "Textured Waves", description: "medium-length tousled hair with natural waves and a relaxed, lived-in texture" },
    { id: "curtains", name: "Curtains", description: "a medium-length 90s curtains style, hair parted in the middle and framing the forehead" },
    { id: "bro-flow", name: "Bro Flow", description: "a medium-length bro flow, hair swept back from the face, falling to about ear length" },
    { id: "faux-hawk", name: "Faux Hawk", description: "a medium-length faux hawk with hair styled up into a soft central peak and shorter sides" },
    { id: "mid-layered", name: "Mid-Length Layered", description: "a soft mid-length layered cut that falls just below the ears with natural movement" },
  ],
  long: [
    { id: "shoulder", name: "Shoulder Length", description: "shoulder-length hair, straight and natural, falling evenly around the face" },
    { id: "long-layered", name: "Long Layered", description: "long layered hair past the shoulders with subtle layers for movement" },
    { id: "man-bun", name: "Man Bun", description: "long hair pulled back into a neat man bun at the back of the head, with no loose hair around the face" },
    { id: "top-knot", name: "Top Knot", description: "long hair gathered into a top knot bun high on the crown, with shorter or faded sides" },
    { id: "long-surfer", name: "Long Surfer", description: "long sun-kissed surfer hair, loose and wavy, falling around the shoulders" },
    { id: "long-curly", name: "Long Curly", description: "long curly hair with defined natural curls falling past the shoulders" },
    { id: "ponytail", name: "Low Ponytail", description: "long hair tied back into a low ponytail at the nape of the neck" },
    { id: "half-up", name: "Half-Up", description: "long hair worn half-up half-down, with the top section tied back and the rest loose" },
    { id: "long-slick", name: "Long Slick-Back", description: "long hair slicked straight back from the forehead, falling smoothly down past the collar" },
  ],
};

export function getHairstyles(length: Length): Hairstyle[] {
  return HAIRSTYLES[length];
}

export function buildPrompt(style: Hairstyle): string {
  return [
    `Edit this photograph so the man has ${style.description}.`,
    `Preserve his face, facial features, skin tone, expression, head shape, pose, lighting, background, and clothing exactly as they are in the original photo.`,
    `Only change the hair on his head.`,
    `Keep the result photorealistic with natural lighting that matches the original photo.`,
  ].join(" ");
}
