# Landmark background images

Drop a photo here for any landmark and it will automatically replace the vector
silhouette in the app's dialect hero header. **Separate images, one per landmark,
give the best result.**

## How to add an image

1. Save the photo in this folder using the exact filenames below (`.jpg` or `.png`).
2. Register it in `src/content/landmarkImages.ts` by uncommenting / adding the matching
   `require(...)` line (Metro needs a static path, so each image must be listed there).

## Filenames (one per dialect landmark)

| File                        | Dialect(s)                       | Landmark                          |
|-----------------------------|----------------------------------|-----------------------------------|
| `martyrs_memorial.jpg`      | Algiers Arabic                   | Maqam E'chahid (Martyrs' Memorial)|
| `domes.jpg`                 | El Oued (Souf)                   | City of a Thousand Domes          |
| `minaret.jpg`               | Modern Standard Arabic           | Grand Mosque                      |
| `koutoubia.jpg`             | Moroccan                         | Koutoubia Minaret                 |
| `sidibou.jpg`               | Tunisian                         | Sidi Bou Said                     |
| `roman_arch.jpg`            | Libyan                           | Arch of Marcus Aurelius, Tripoli  |
| `cairo.jpg`                 | Egyptian                         | Cairo (pyramids + tower)          |
| `umayyad.jpg`               | Levantine, Syrian                | Umayyad Mosque, Damascus          |
| `dome_of_rock.jpg`          | Palestinian                      | Dome of the Rock, Jerusalem       |
| `cedar.jpg`                 | Lebanese                         | Cedars of Lebanon                 |
| `petra.jpg`                 | Jordanian                        | Petra — The Treasury              |
| `kaaba_tower.jpg`           | Saudi                            | Makkah & the Clock Tower          |
| `burj.jpg`                  | Gulf                             | Gulf skyline                      |
| `malwiya.jpg`               | Iraqi                            | Malwiya Minaret, Samarra          |
| `meroe.jpg`                 | Sudanese                         | Pyramids of Meroë                 |
| `sanaa.jpg`                 | Yemeni                           | Old City of Sana'a                |

Recommended: landscape, at least 1200px wide. The header darkens the image so light
text stays readable, so bright daytime photos work fine.
