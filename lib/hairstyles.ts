export type Length = "short" | "medium" | "long";

export interface Hairstyle {
  id: string;
  name: string;
  description: string;
}

export const HAIRSTYLES: Record<Length, Hairstyle[]> = {
  short: [
    { id: "buzz", name: "Buzz Cut", description: "a buzz cut: hair clipped uniformly to roughly 3mm all over the head, very short, scalp visible through the hair" },
    { id: "crew", name: "Crew Cut", description: "a classic crew cut: short hair about 2cm on top with cleanly tapered short sides, square military shape across the forehead" },
    { id: "high-fade", name: "High Fade", description: "a high skin fade: hair on top kept short and styled, with the sides shaved down to the skin starting high on the head and a sharp transition line" },
    { id: "low-taper", name: "Low Taper", description: "a low taper: short neat hair on top, with the sides only narrowing in length at the very bottom near the ears and neckline" },
    { id: "french-crop", name: "French Crop", description: "a French crop: short hair on top with a straight blunt fringe falling forward across the forehead, and faded short sides" },
    { id: "ivy-league", name: "Ivy League", description: "an Ivy League cut: short hair combed neatly to one side with a clean side parting, slightly longer on top than a crew cut, preppy and tidy" },
    { id: "caesar", name: "Caesar Cut", description: "a Caesar cut: uniformly short hair all over with a straight horizontal fringe combed forward across the forehead, no taper, no layers" },
    { id: "textured-crop", name: "Textured Crop", description: "a textured crop: short choppy messy hair on top with a small forward-pushed fringe and a defined hairline, sides cropped tight" },
    { id: "short-pomp", name: "Short Pompadour", description: "a short pompadour: tapered short sides with the top section swept dramatically up and back into a small wave above the forehead, glossy finish" },
  ],
  medium: [
    { id: "side-part", name: "Side Part", description: "a sharp side part: a clean defined parting line on one side of the head, with hair combed flat down on each side of the part, conservative business style" },
    { id: "quiff", name: "Modern Quiff", description: "a modern quiff: the front section of hair lifted tall up and back into a voluminous wave above the forehead, sides much shorter than the top" },
    { id: "slick-back", name: "Slick Back", description: "a slick back: all hair combed straight back from the forehead with pomade for a wet glossy shiny look, no parting at all" },
    { id: "comb-over", name: "Comb Over", description: "a comb over: hair parted low on one side and swept across the top of the head to the opposite side, longer hair on top combed sideways across" },
    { id: "textured-waves", name: "Textured Waves", description: "medium-length naturally wavy hair worn loose and tousled, no product, soft natural waves with movement, hair tucked behind one ear" },
    { id: "curtains", name: "Curtains", description: "90s curtains: hair parted straight down the middle and falling forward to frame both sides of the forehead like curtains, length to the cheekbones" },
    { id: "bro-flow", name: "Bro Flow", description: "a bro flow: medium-length hair grown out and pushed loosely back away from the forehead, slightly wavy and natural with no gel, length around the ears" },
    { id: "faux-hawk", name: "Faux Hawk", description: "a faux hawk: hair pulled up into a central peak running from the forehead to the crown, with dramatically shorter hair on both sides" },
    { id: "mid-layered", name: "Mid-Length Layered", description: "a mid-length layered cut: hair falling in soft visible layers around the ears and the back of the neck, with feathered ends and natural movement" },
  ],
  long: [
    { id: "shoulder", name: "Shoulder Length", description: "shoulder-length straight hair: hair cut evenly and falling straight down to the shoulders, framing both sides of the face" },
    { id: "long-layered", name: "Long Layered", description: "long layered hair past the shoulders with clearly visible layers cut into it for movement and lightness, framing the face" },
    { id: "man-bun", name: "Man Bun", description: "a man bun: all hair gathered and tied into a tight round bun at the lower back of the head, NO loose hair hanging around the face — the sides and forehead are completely clear of hanging hair" },
    { id: "top-knot", name: "Top Knot", description: "a top knot: hair gathered into a tight round bun high on the crown of the head, with the sides shaved short or undercut so they are clearly different from the top" },
    { id: "long-surfer", name: "Long Surfer", description: "long surfer hair: wavy beachy textured hair falling messily around the shoulders, lived-in tousled look, naturally parted to one side" },
    { id: "long-curly", name: "Long Curly", description: "long curly hair: defined coiled ringlet curls cascading past the shoulders, voluminous, bouncy and full" },
    { id: "ponytail", name: "Low Ponytail", description: "a low ponytail: all hair pulled back tightly and gathered into a ponytail at the nape of the neck, NO loose strands around the face or forehead" },
    { id: "half-up", name: "Half-Up", description: "a half-up half-down style: the top section of hair pulled back and tied behind the head into a small bun or knot, with the rest of the hair hanging loose down past the shoulders" },
    { id: "long-slick", name: "Long Slick-Back", description: "long slicked-back hair: all hair pulled straight back from the forehead with heavy pomade for a wet shiny finish, falling smoothly down past the collar" },
  ],
};

export function getHairstyles(length: Length): Hairstyle[] {
  return HAIRSTYLES[length];
}

const LENGTH_ANCHOR: Record<Length, string> = {
  short: "The result must clearly show SHORT hair: roughly 0 to 4 cm (0 to 1.5 inches) long, never longer than the tops of the ears, never falling onto the forehead beyond a small fringe. Cut his current hair down if it is currently longer.",
  medium: "The result must clearly show MEDIUM-LENGTH hair: roughly 8 to 15 cm (3 to 6 inches) long, reaching at least to the bottom of the ears and ideally to the jawline or collar. The hair must be visibly longer than the tops of the ears. If his current hair is shorter than this, you MUST GROW the hair to the medium length described — treat this as both growing and restyling the hair. Do not return a short cut.",
  long: "The result must clearly show LONG hair: at least 20 cm (8 inches) long, reaching to the shoulders or longer. If his current hair is shorter, you MUST GROW the hair to long length — treat this as both growing and restyling the hair. Do not return a short or medium cut.",
};

export function buildPrompt(style: Hairstyle, length: Length): string {
  return [
    `Task: restyle the hair on this man's head to be ${style.description}.`,
    LENGTH_ANCHOR[length],
    `This is a hairstyle TRANSFORMATION. The resulting hair MUST look clearly and visibly different from his current hair — completely replace his existing hair. Do not retain his current length, parting, texture, or shape. The new hairstyle should be obvious at a glance and unmistakably match the description above, including the length.`,
    `Keep the following identical to the original photo: his face and facial features, his eyes, his skin tone, his facial expression, his head shape, any beard or facial hair, his clothing, his body and pose, and the background. Match the original photo's lighting and camera angle on the new hair. Keep his natural hair color from the original photo.`,
    `Render the result as a fully photorealistic photograph. Do NOT return the original image unchanged.`,
  ].join(" ");
}
