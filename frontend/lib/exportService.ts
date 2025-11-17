import jsPDF from 'jspdf';

export async function exportCourseToPDF(
  title: string,
  content: string,
  metadata?: { date?: string; author?: string }
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  if (metadata?.date) {
    doc.text(`Date: ${metadata.date}`, 20, 30);
  }
  if (metadata?.author) {
    doc.text(`Auteur: ${metadata.author}`, 20, 35);
  }

  // Content
  doc.setFontSize(12);
  doc.setTextColor(0);
  const lines = doc.splitTextToSize(content, 170);
  doc.text(lines, 20, 45);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('Généré par Studia - AI Learning', 105, 290, { align: 'center' });
  }

  doc.save(`${title}.pdf`);
}

export async function exportFlashcardsToPDF(
  title: string,
  flashcards: { front: string; back: string }[]
) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 20, { align: 'center' });

  let yPosition = 40;

  flashcards.forEach((card, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Card number
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Carte ${index + 1}`, 20, yPosition);

    yPosition += 10;

    // Front
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Question:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const frontLines = doc.splitTextToSize(card.front, 170);
    doc.text(frontLines, 20, yPosition + 5);

    yPosition += frontLines.length * 5 + 10;

    // Back
    doc.setFont('helvetica', 'bold');
    doc.text('Réponse:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const backLines = doc.splitTextToSize(card.back, 170);
    doc.text(backLines, 20, yPosition + 5);

    yPosition += backLines.length * 5 + 15;

    // Separator
    doc.setDrawColor(200);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
  });

  doc.save(`${title}.pdf`);
}