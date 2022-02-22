import PdfPrinter from "pdfmake";
import striptags from "striptags";
import axios from "axios";
import { dirname, join } from "path"
import { fileURLToPath } from "url"

export const getPDFReadableStream = async (profile) => {
const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

  let imagePart = {};
  if (profile.image) {
    const response = await axios.get(profile.image, {
      responseType: "arraybuffer",
    });
    const profileCoverURLParts = profile.image.split("/");
    const fileName = profileCoverURLParts[profileCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width: 150, margin: [0, 0, 0, 40] };
  }

  // const experiences  =  profile.experiences.map(exp => `Role : ${exp.role}\n Company : ${exp.company}\n Location : ${exp.area}\n Start Date : ${exp.startDate}\n End Date :${exp.endDate}\n\n`
  //   );


  const docDefinition = {
    content: [

      {
        columns: [
          
          imagePart,
          [
            { text: `${profile.name} ${profile.surname}`, fontSize: 15, bold: true, margin: [0, 0, 0, 10] },
            { text: striptags(profile.title), lineHeight: 2 },
            { text: striptags(profile.email), lineHeight: 2 },
            { text: striptags(profile.area), lineHeight: 2 },
            { text: striptags(profile.bio), lineHeight: 2 }
            
          ]
        ]
      },
      {
        alignment: 'justify',
        columns: [
            {
           //  ...experiences
            },
            [

              {
                  text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Malit profecta versatur nomine ocurreret multavit, officiis viveremus aeternum superstitio suspicor alia nostram, quando nostros congressus susceperant concederetur leguntur iam, vigiliae democritea tantopere causae, atilii plerumque ipsas potitur pertineant multis rem quaeri pro, legendum didicisse credere ex maluisset per videtis. Cur discordans praetereat aliae ruinae dirigentur orestem eodem, praetermittenda divinum. Collegisti, deteriora malint loquuntur officii cotidie finitas referri doleamus ambigua acute. Adhaesiones ratione beate arbitraretur detractis perdiscere, constituant hostis polyaeno. Diu concederetur.'
              },
              {
                  text: '\n Lorem ipsum dolor sit amet, consectetur adipisicing elit. Malit profecta versatur nomine ocurreret multavit, officiis viveremus aeternum superstitio suspicor alia nostram, quando nostros congressus susceperant concederetur leguntur iam, vigiliae democritea tantopere causae, atilii plerumque ipsas potitur pertineant multis rem quaeri pro, legendum didicisse credere ex maluisset per videtis. Cur discordans praetereat aliae ruinae dirigentur orestem eodem, praetermittenda divinum. Collegisti, deteriora malint loquuntur officii cotidie finitas referri doleamus ambigua acute. Adhaesiones ratione beate arbitraretur detractis perdiscere, constituant hostis polyaeno. Diu concederetur.'
              }
            ]
        ]
    },

    ],
    defaultStyle: {
        font: "Helvetica",
        columnGap: 20
      },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  return pdfReadableStream;
};