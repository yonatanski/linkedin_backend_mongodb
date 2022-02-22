import PdfPrinter from "pdfmake";
import striptags from "striptags";
import axios from "axios";
import { format, compareAsc } from 'date-fns'

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

  console.log(  ["test", 
      "test"].map(exp => ({text:"test", fontSize: 15, bold: true, margin: [0, 0, 0, 10] })))

   

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
          // ...profile.experiences.map(exp => `Role : ${exp.role}\n Company : ${exp.company}\n Location : ${exp.area}\n Start Date : ${exp.startDate}\n End Date :${exp.endDate}\n\n`
          // )
          
       profile.experiences.map(exp => ({text:`Role : ${exp.role}\n\n Company : ${exp.company}\n\n Location : ${exp.area}\n\n Start Date : ${format(new Date(exp.startDate), 'MM/dd/yyyy')}\n\n End Date :${format(new Date(exp.endDate), 'MM/dd/yyyy')}\n\n Description : ${exp.description} \n\n\n`, fontSize: 15, bold: false, margin: [0, 0, 0, 15] }))
      
      
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
