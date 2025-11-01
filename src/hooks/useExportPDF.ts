import { useCallback } from "react";
import { domToPng } from "modern-screenshot";
import jsPDF from "jspdf";

export function useExportPDF() {
  const exportToPDF = useCallback(async (elementId: string, fileName: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error("Element not found:", elementId);
        return;
      }

      // Aguardar um pouco para garantir que todos os gráficos estejam renderizados
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calcular escala para caber com padding (24px em cada lado = 48px total)
      const elementWidth = element.offsetWidth;
      const paddingTotal = 48;
      const scaleToFit = (elementWidth - paddingTotal) / elementWidth;

      // Capturar o elemento com escala reduzida e padding
      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        features: {
          removeControlCharacter: true,
        },
        style: {
          padding: "24px",
          transform: `scale(${scaleToFit})`,
          transformOrigin: "top left",
        },
      });

      // Criar imagem para obter dimensões
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Converter para PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (img.height * imgWidth) / img.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF("p", "mm", "a4");

      // Adicionar primeira página
      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Salvar PDF
      pdf.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Por favor, tente novamente.");
    }
  }, []);

  return { exportToPDF };
}
