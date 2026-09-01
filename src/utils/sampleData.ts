import {
  BottleSpec,
  Experiment,
  KTIStructure,
  ReferenceItem,
  ResearchNote,
  WorkspaceState,
} from '../types';
import { calculateDensity, classifyEcobrick } from './calculations';

export const STANDARD_BOTTLES: BottleSpec[] = [
  {
    id: 'bottle-330',
    name: 'Botol PET Mini 330 ml (Standar Uji Dasar KTI)',
    nominalVolume: 330,
    tareWeight: 16,
    height: 17.5,
    diameter: 5.8,
  },
  {
    id: 'bottle-500',
    name: 'Botol PET Sedang 500 ml',
    nominalVolume: 500,
    tareWeight: 20,
    height: 21.0,
    diameter: 6.2,
  },
  {
    id: 'bottle-600',
    name: 'Botol PET Standar 600 ml (Standar Umum)',
    nominalVolume: 600,
    tareWeight: 24,
    height: 23.0,
    diameter: 6.5,
  },
  {
    id: 'bottle-1500',
    name: 'Botol PET Besar 1500 ml (Modul Struktural)',
    nominalVolume: 1500,
    tareWeight: 45,
    height: 31.0,
    diameter: 9.0,
  },
];

export const JURY_PERSONAS = [
  {
    id: 'methodology' as const,
    name: 'Dr. Hendra Pratama, M.Sc.',
    title: 'Reviewer Metodologi Riset & Pendidikan Lingkungan (BRIDA)',
    focus: 'Kerapian Metodologi, Desain Studi Literatur & ESLF',
    demeanor:
      'Sangat teliti memeriksa sintesis bukti empiris, triangulasi data kuantitatif (N-gain), serta validitas 5 dimensi Ecobrick Sustainable Learning Framework.',
  },
  {
    id: 'substance' as const,
    name: 'Prof. Dr. Ratna Kusuma, M.Eng.',
    title: 'Guru Besar Sains Polimer & Materialitas Sirkular',
    focus: 'Standar Teknis Densitas (0.33 g/ml) & Isolasi Mekanis PET',
    demeanor:
      'Fokus pada standar teknis pemadatan botol 330 ml (min 110 g) hingga 600 ml, stabilitas struktural, reduksi rongga udara, dan materialitas sirkular.',
  },
  {
    id: 'implementation' as const,
    name: 'Ir. Bambang Setiawan, MT.',
    title: 'Praktisi Rekayasa Pedagogis & Sekolah Adiwiyata',
    focus: 'Implementasi PjBL, Sinergi Orang Tua & Habituasi',
    demeanor:
      'Menguji dekonstruksi knowledge-action gap pada siswa, kemitraan orang tua sebagai arsitek karakter domestik, serta integrasi program Adiwiyata.',
  },
  {
    id: 'skeptical' as const,
    name: 'Dr. Irwan Susanto, Ph.D.',
    title: 'Penguji Kritis Teori Perilaku & LKTI Examination',
    focus: 'Uji Kritis Teori TPB, VBN & Keberlanjutan Nilai',
    demeanor:
      'Mencari celah pada asumsi perubahan perilaku, korelasi norma subjektif dan norma pribadi siswa, serta ketahanan program pasca-kegiatan.',
  },
];

export const SAMPLE_KTI: KTIStructure = {
  title:
    'Pemanfaatan Ecobrick dalam Perspektif Rekayasa Pedagogis Berkelanjutan: Sinergi Sekolah dan Orang Tua Menuju Lingkungan Mandiri',
  authors:
    'Muhammad Arya Adekamula, Adwa Nidal Razak, Muhammad Ardis Ghilman Hidarman (Pembimbing: Muzanni Jauhari, M.Pd.)',
  institution: 'MA Plus Abu Hurairah, Kota Mataram (2026) - BRIDA Kota Mataram',
  abstract:
    'Penelitian ini mengkaji pemanfaatan ecobrick dalam perspektif rekayasa pedagogis berkelanjutan sebagai strategi pengelolaan sampah plastik dan pendidikan lingkungan di sekolah. Kajian ini menggunakan metode studi literatur deskriptif-kualitatif dengan sintesis bukti empiris dari berbagai sumber ilmiah yang relevan. Hasil kajian menunjukkan bahwa ecobrick memiliki nilai teknis dan edukatif karena mampu mengubah limbah plastik menjadi material sirkular yang bermanfaat sekaligus menjadi media pembelajaran kontekstual. Kegiatan ecobrick melalui Project-Based Learning mendorong kesadaran, tanggung jawab, dan kebiasaan pro-lingkungan peserta didik, sedangkan keterlibatan orang tua memperkuat keberlanjutan pembiasaan di rumah. Dengan demikian, Ecobrick Sustainable Learning Framework (ESLF) dapat menjadi model integratif yang menghubungkan sekolah, siswa, dan keluarga dalam membangun budaya lingkungan yang mandiri dan berkelanjutan.',
  chapter1_Introduction: {
    background:
      'Permasalahan sampah plastik di lingkungan sekolah merupakan persoalan yang tidak hanya berkaitan dengan kebersihan, tetapi juga dengan pembentukan kebiasaan dan karakter peserta didik. Sekolah menghasilkan sampah plastik dari kantin, bekal siswa, botol minuman, dan kemasan sekali pakai yang digunakan dalam aktivitas harian. Jika tidak dikelola dengan baik, sampah tersebut akan menumpuk, mengganggu kenyamanan belajar, dan membentuk budaya konsumsi yang kurang ramah lingkungan. Karena itu, diperlukan strategi pengelolaan sampah yang tidak hanya menekan volume limbah, tetapi juga mendorong perubahan perilaku secara berkelanjutan. Ecobrick memberi ruang bagi siswa untuk mengubah limbah plastik menjadi media yang memiliki nilai guna sekaligus nilai edukatif melalui proses yang terukur dan bertanggung jawab. Sejumlah penelitian sebelumnya menunjukkan potensi ecobrick dalam pendidikan lingkungan: Bachri et al. (2021) menunjukkan peningkatan literasi sains siswa, Elvania et al. (2023) menegaskan efektivitas sebagai media pembelajaran, serta Adriyani (2025) dan Sunandar (2025) membuktikan penguatan pemahaman siswa terhadap pengelolaan sampah. Di sisi lain, Liobikienė dan Poškus (2019) menegaskan bahwa pengetahuan lingkungan perlu diperkuat oleh nilai dan keyakinan agar dapat berubah menjadi perilaku pro-lingkungan.',
    problemFormulation: [
      'Bagaimana kondisi permasalahan sampah plastik di lingkungan sekolah dan dampaknya terhadap keberlanjutan lingkungan pendidikan?',
      'Bagaimana konsep dan efektivitas ecobrick sebagai solusi pengelolaan sampah plastik berbasis pendidikan lingkungan?',
      'Bagaimana penerapan teori Theory of Planned Behavior (TPB) dan Value-Belief-Norm (VBN) dalam menjelaskan perubahan perilaku lingkungan peserta didik melalui kegiatan ecobrick?',
      'Bagaimana efektivitas model Project-Based Learning dalam meningkatkan kesadaran lingkungan siswa melalui kegiatan pembuatan ecobrick?',
      'Bagaimana peran orang tua sebagai mitra pedagogis dalam mendukung keberhasilan program ecobrick di lingkungan sekolah dan rumah?',
      'Bagaimana model sinergi sekolah dan keluarga dapat mendukung terciptanya lingkungan yang mandiri dan berkelanjutan melalui program ecobrick?',
    ],
    researchObjectives: [
      'Mendeskripsikan kondisi dan karakteristik permasalahan sampah plastik di lingkungan sekolah.',
      'Menganalisis konsep, manfaat, dan standar teknis ecobrick sebagai alternatif pengelolaan sampah plastik.',
      'Mengkaji relevansi teori TPB dan VBN dalam pembentukan perilaku pro-lingkungan peserta didik.',
      'Mengevaluasi efektivitas penerapan Project-Based Learning berbasis ecobrick dalam meningkatkan kesadaran lingkungan siswa.',
      'Menganalisis kontribusi orang tua dalam proses pembentukan karakter lingkungan peserta didik.',
      'Merumuskan model kolaborasi antara sekolah dan keluarga dalam implementasi program ecobrick yang berkelanjutan.',
      'Menyusun rekomendasi implementasi program ecobrick yang mendukung pengembangan sekolah berwawasan lingkungan dan program Adiwiyata.',
    ],
    significance:
      'a. Manfaat Teoretis: Memperkaya kajian ilmiah mengenai pendidikan lingkungan, literasi ekologis, rekayasa pedagogis berkelanjutan, dan PjBL.\nb. Manfaat bagi Sekolah: Acuan program pengelolaan sampah berorientasi karakter, mendukung P5, budaya sekolah hijau, dan Adiwiyata.\nc. Manfaat bagi Guru: Menyediakan strategi pembelajaran kontekstual lintas disiplin ilmu.\nd. Manfaat bagi Peserta Didik: Meningkatkan kesadaran ekologis, tanggung jawab, ketekunan, dan kemandirian.\ne. Manfaat bagi Orang Tua & Masyarakat: Menguatkan peran keluarga sebagai pendamping dan teladan pengelolaan sampah rumah tangga.\nf. Manfaat bagi Pemerintah & BRIDA: Bahan pertimbangan penyusunan kebijakan pendidikan lingkungan dan pencapaian target SDGs lokal.',
  },
  chapter2_LiteratureReview: {
    plasticWasteContext:
      'Sampah plastik sekali pakai sulit terurai dan terus menumpuk di lingkungan sekolah sehingga menurunkan kualitas tanah, mencemari air, dan memperburuk estetika. Ecobrick menawarkan pendekatan alternatif yang menggabungkan aspek edukasi dan pemanfaatan kembali limbah dalam strategi ekonomi sirkular (Budiman et al., 2024; Elvarisna et al., 2024).',
    ecobrickConceptAndStandards:
      'Ecobrick didefinisikan sebagai teknik isolasi plastik non-biologis ke dalam botol polietilena tereftalat (PET) melalui kompresi mekanis manual. Standar teknis mewajibkan ambang densitas minimal 0.33 g/ml (pada botol 330 ml massa minimal ~110 gram; pada botol 600 ml ~200 gram). Tanpa kepadatan yang cukup, botol tidak memiliki stabilitas struktural untuk modul konstruksi ringan atau media edukatif.',
    mechanicalDensityPrinciples:
      'Penerapan Theory of Planned Behavior (TPB - De Leeuw et al., 2015) menjelaskan perubahan perilaku dari sikap, norma subjektif, dan persepsi kontrol. Value-Belief-Norm (VBN - Liobikienė & Poškus, 2019) menguraikan bagaimana nilai biosferik membentuk norma moral pribadi. Keterlibatan psikomotorik dalam Project-Based Learning (PjBL) bertindak sebagai katalis kesadaran yang menjembatani knowledge-action gap (Sakti Jaya et al., 2025; Hapipah et al., 2024; Bachri et al., 2021).',
  },
  chapter3_Methodology: {
    samplePreparation:
      'Studi literatur deskriptif-kualitatif dengan sintesis bukti empiris. Menelaah, membandingkan, dan menyintesiskan literatur ilmiah mutakhir bereputasi (standar APA 7th Edition & BRIDA Kota Mataram 2026), memprioritaskan studi dengan metrik kuantitatif (N-gain, persentase kesadaran lingkungan, densitas material).',
    experimentalDesign:
      'Penerapan Ecobrick Sustainable Learning Framework (ESLF) melalui 5 dimensi terintegrasi: (1) Audit Limbah, (2) Inkuiri Pedagogis melalui PjBL, (3) Transformasi Literasi, (4) Habituasi Perilaku & Dukungan Domestik Orang Tua, serta (5) Kemandirian Institusional Sekolah.',
    toolsAndMaterials:
      'Dokumen regulasi resmi (BRIDA Kota Mataram 2026), artikel jurnal bereputasi, laporan pengabdian masyarakat, dataset sintesis AI akademis (Consensus & Elicit), neraca analitis digital laboratorium, jangka sorong, dan modul standarisasi botol PET.',
    measurementProcedure:
      'Triangulasi data antara standar teknik sipil (densitas minimum 0.33 g/ml) dan metrik psikologi pendidikan (skala TPB/VBN, N-gain peningkatan sikap lingkungan). Analisis interpretatif untuk mengungkap rekayasa pedagogis berkelanjutan.',
  },
  chapter4_ResultsAndDiscussion: {
    dataSummary:
      'Sintesis data menunjukkan: (1) Standar teknis densitas minimal 0.33 g/ml (110 g pada botol 330 ml) terbukti memberikan stabilitas struktural; (2) PjBL ecobrick menghasilkan peningkatan sikap lingkungan signifikan dengan N-gain 0.61 (Susilawati et al., 2017) dan kesadaran lingkungan 87% (Sakti Jaya et al., 2025); (3) Pemahaman manfaat limbah mencapai 90% (Ardiansari et al., 2024) dan kelayakan bahan ajar 87.2% (Hapipah et al., 2024).',
    densityAnalysis:
      'Analisis materialitas sirkular membuktikan bahwa limbah plastik yang terisolasi dengan kompresi mekanis bertahap mampu mengeliminasi rongga udara dan mencegah pelepasan mikroplastik, sekaligus melatih kedisiplinan dan ketelitian siswa.',
    comparisonDiscussion:
      'Dekonstruksi knowledge-action gap terjadi karena siswa bertransformasi dari penerima informasi pasif menjadi komunikator perubahan (Carolina et al., 2024). Sinergi orang tua sebagai arsitek karakter domestik di rumah memastikan nilai dan norma pro-lingkungan melekat secara permanen (Nurwidodo et al., 2020; Liobikienė & Poškus, 2019).',
  },
  chapter5_Conclusion: {
    conclusion:
      'Ecobrick merupakan inovasi bernilai ganda: solusi teknis materialitas sirkular dan instrumen rekayasa pedagogis berkelanjutan. PjBL efektif mereduksi knowledge-action gap, sementara integrasi orang tua dan sekolah dalam model ESLF (Ecobrick Sustainable Learning Framework) mewujudkan kemandirian lingkungan yang kokoh.',
    recommendations: [
      'Bagi BRIDA Kota Mataram: Menjadikan ESLF sebagai rujukan kebijakan inovasi pendidikan lingkungan berbasis partisipasi sekolah dan masyarakat.',
      'Bagi Sekolah & Guru: Mengintegrasikan ecobrick ke dalam P5, kurikulum kontekstual, dan program Adiwiyata.',
      'Bagi Orang Tua: Memperkuat pendampingan dan keteladanan pemilahan sampah di ranah rumah tangga.',
      'Bagi Peneliti Selanjutnya: Melakukan studi eksperimen longitudinal untuk mengukur retensi perilaku pro-lingkungan multi-tahun.',
    ],
  },
};

export const SAMPLE_REFERENCES: ReferenceItem[] = [
  {
    id: 'ref-001',
    workspaceId: 'sample-ws',
    type: 'PRIMARY_KTI',
    title:
      'Sinergi sekolah-orang tua dalam pengelolaan sampah plastik berbasis ecobrick [Laporan riset/Draft KTI]',
    authors: 'Arya, M., Nidal, A., & Hidarman, A. G.',
    year: 2026,
    source: 'Dibimbing oleh Muzanni Jauhari. Mataram: MA Plus Abu Hurairah',
    citationCode: '[REF-001]',
    abstractOrSummary:
      'Laporan riset utama yang merumuskan Ecobrick Sustainable Learning Framework (ESLF) dengan mengintegrasikan 5 dimensi pedagogis dan sinergi sekolah-orang tua.',
    keyFindings: [
      'Model ESLF menghubungkan audit limbah, inkuiri PjBL, transformasi literasi, habituasi keluarga, dan kemandirian institusi.',
      'Menetapkan standar teknis kompresi mekanis botol 330 ml minimal 110 gram (densitas >= 0.33 g/ml).',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-002',
    workspaceId: 'sample-ws',
    type: 'STANDARD_GUIDE',
    title: 'Panduan penulisan karya tulis ilmiah (KTI) sekolah berkelanjutan',
    authors: 'Badan Riset dan Inovasi Daerah (BRIDA) Kota Mataram',
    year: 2026,
    source: 'BRIDA Kota Mataram',
    citationCode: '[REF-002]',
    abstractOrSummary:
      'Pedoman resmi regulasi daerah Kota Mataram untuk standar penulisan KTI, metodologi ilmiah, dan relevansi inovasi lokal.',
    keyFindings: [
      'Menjadi landasan kebijakan dan legitimasi operasional riset KTI sekolah berkelanjutan 2026.',
      'Mendorong pemanfaatan inovasi berbasis partisipasi aktif warga sekolah dan masyarakat.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-003',
    workspaceId: 'sample-ws',
    type: 'STANDARD_GUIDE',
    title: 'Pedoman struktur umum karya tulis ilmiah (KTI) 2026',
    authors: 'Panitia Riset Sekolah',
    year: 2026,
    source: 'Panitia Riset Sekolah, Mataram',
    citationCode: '[REF-003]',
    abstractOrSummary:
      'Pedoman format penulisan, sistematika 5 bab, serta ketentuan tata tulis ilmiah berbasis standar akademik nasional.',
    keyFindings: [
      'Standar struktur rigid 5 bab KTI dari latar belakang hingga kesimpulan dan saran.',
      'Ketentuan format daftar pustaka APA 7th Edition secara alfabetis.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-004',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Using the theory of planned behavior to identify key beliefs underlying pro-environmental behavior in high-school students: Implications for educational interventions',
    authors: 'de Leeuw, A., Valois, P., Ajzen, I., & Schmidt, P.',
    year: 2015,
    source: 'Journal of Environmental Psychology, 42, 128–138',
    citationCode: '[REF-004]',
    doiOrUrl: 'https://doi.org/10.1016/j.jenvp.2015.03.005',
    abstractOrSummary:
      'Kajian empiris penggunaan Theory of Planned Behavior (TPB) dalam membedah keyakinan dasar perilaku pro-lingkungan siswa SMA.',
    keyFindings: [
      'Sikap, norma subjektif, dan kontrol perilaku menentukan stabilitas niat tindakan lingkungan.',
      'Intervensi pendidikan harus melibatkan penguatan efikasi diri dan dukungan lingkungan sosial.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-005',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Perencanaan pengembangan sekolah Adiwiyata di SMP N 7 Sijunjung dengan pengelolaan sampah menjadi ecobrick',
    authors: 'Elvarisna, E., Sari, R., Asmendri, A., & Sari, M.',
    year: 2024,
    source: 'De Journal (Dediaksi Education Journal), 5(2)',
    citationCode: '[REF-005]',
    doiOrUrl: 'https://doi.org/10.56667/dejournal.v5i2.1625',
    abstractOrSummary:
      'Studi integrasi ecobrick ke dalam dokumen perencanaan dan budaya sekolah Adiwiyata.',
    keyFindings: [
      'Ecobrick efektif diposisikan sebagai pilar budaya sekolah berkelanjutan, bukan sekadar kegiatan sampingan.',
      'Meningkatkan partisipasi terstruktur seluruh warga sekolah dalam pemilahan sampah.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-006',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Learning innovation: PBL-STEM 4H ecobrick material teaching for 7th graders to enhance ecoliteracy',
    authors: 'Hapipah, H., Rubini, B., Permanasari, A., Kodama, Y., & Rachman, I.',
    year: 2024,
    source: 'Jurnal Pendidikan Sains Indonesia (Indonesian Journal of Science Education), 12(4)',
    citationCode: '[REF-006]',
    doiOrUrl: 'https://doi.org/10.24815/jpsi.v12i4.40691',
    abstractOrSummary:
      'Inovasi pembelajaran PBL-STEM 4H dengan bahan ecobrick untuk meningkatkan ecoliteracy siswa.',
    keyFindings: [
      'Kelayakan bahan ajar mencapai 87.2% (kategori sangat layak).',
      'Integrasi konsep STEM (massa, volume, densitas) menjadikan ecobrick media pembelajaran sains terapan yang bermakna.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-007',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'The importance of environmental knowledge for private and public sphere pro-environmental behavior: Modifying the value-belief-norm theory',
    authors: 'Liobikienė, G., & Poškus, M. S.',
    year: 2019,
    source: 'Sustainability, 11(12), 3324',
    citationCode: '[REF-007]',
    doiOrUrl: 'https://doi.org/10.3390/su11123324',
    abstractOrSummary:
      'Modifikasi teori Value-Belief-Norm (VBN) yang membuktikan pentingnya pengetahuan lingkungan dalam mengaktivasi norma pribadi moral.',
    keyFindings: [
      'Pengetahuan lingkungan harus bertransformasi menjadi norma pribadi agar konsisten di ranah privat (rumah) dan publik (sekolah).',
      'Nilai biosferik menjadi fondasi kesadaran ekologis jangka panjang.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-008',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'The role of eco-school program (Adiwiyata) towards environmental literacy of high school students',
    authors: 'Nurwidodo, N., Amin, M., Ibrohim, I., & Sueb, S.',
    year: 2020,
    source: 'European Journal of Educational Research, 9(3), 1089–1103',
    citationCode: '[REF-008]',
    doiOrUrl: 'https://doi.org/10.12973/eu-jer.9.3.1089',
    abstractOrSummary:
      'Investigasi kontribusi program sekolah Adiwiyata terhadap literasi lingkungan siswa sekolah menengah.',
    keyFindings: [
      'Sekolah Adiwiyata secara terukur meningkatkan literasi ekologis dan kesadaran lingkungan siswa.',
      'Sinergi dengan keluarga mempercepat pembentukan karakter peduli lingkungan.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-009',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'PBL on waste management improved attitudes: Quasi-experimental study in junior high science',
    authors: 'Susilawati, S., et al.',
    year: 2017,
    source: 'Indonesian Journal of Science Education, 5(1)',
    citationCode: '[REF-009]',
    abstractOrSummary:
      'Studi kuasi-eksperimental penerapan Project-Based Learning dalam pengelolaan sampah pada siswa SMP.',
    keyFindings: [
      'Pencapaian skor N-gain sebesar 0.61 (kategori peningkatan sedang-tinggi).',
      'PjBL terbukti secara statistik memperbaiki sikap lingkungan peserta didik.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-010',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Utilization of plastic waste with ecobricks: Education and training for junior high school students',
    authors: 'Adriyani, R.',
    year: 2025,
    source: 'Journal of Innovation and Applied Technology, 11(2)',
    citationCode: '[REF-010]',
    doiOrUrl: 'https://doi.org/10.21776/ub.jiat.2025.011.02.11',
    abstractOrSummary:
      'Pelatihan dan edukasi pemanfaatan sampah plastik melalui ecobrick bagi siswa sekolah menengah pertama.',
    keyFindings: [
      'Peningkatan skor pemahaman praktikum sebesar 77% pasca-pelatihan.',
      'Siswa mampu mempraktikkan pemilahan dan pemadatan plastik secara mandiri.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-011',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title: 'Aksi lingkungan: Praktek membuat ecobrick di sekolah dasar',
    authors: 'Ardiansari, L., Arista, H., Rahma, A. A., & Swari, U. R.',
    year: 2024,
    source: 'Lini Inovasi: Jurnal Pengabdian kepada Masyarakat, 9(4)',
    citationCode: '[REF-011]',
    doiOrUrl: 'https://doi.org/10.36312/linov.v9i4.2211',
    abstractOrSummary:
      'Dokumentasi praktik ecobrick di sekolah dasar dalam meningkatkan pemahaman bahaya plastik.',
    keyFindings: [
      'Pemahaman siswa terhadap manfaat pengelolaan sampah mencapai 90%.',
      'Praktik langsung melatih kesabaran dan kerja sama kelompok siswa.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-012',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Edukasi ecobrick sebagai upaya meningkatkan kesadaran akan pentingnya lingkungan di sekolah dasar',
    authors: 'Azzahra, N., & Hardiyanti, A.',
    year: 2024,
    source: 'Jurnal Tekmulogi, 4(1)',
    citationCode: '[REF-012]',
    doiOrUrl: 'https://doi.org/10.17509/tmg.v4i1.61724',
    abstractOrSummary:
      'Peningkatan kepedulian lingkungan usia dini melalui media ecobrick di sekolah dasar.',
    keyFindings: [
      'Ecobrick mempermudah transfer konsep daur ulang plastik menjadi media bermain dan belajar yang konkret.',
    ],
    relevanceRating: 'Medium',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-013',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Penerapan literasi sains melalui pemanfaatan ecobrick di kelas V SD Negeri 1 Tanrutedong Kabupaten Sidenreng Rappang',
    authors: 'Bachri, R. A. K., Muriati, S., & Nasiruddin, F. A. Z.',
    year: 2021,
    source: 'Jurnal Klasikal, 3(2), 35-50',
    citationCode: '[REF-013]',
    doiOrUrl: 'https://doi.org/10.52208/klasikal.v3i2.96',
    abstractOrSummary:
      'Penerapan literasi sains berbasis ecobrick yang membuktikan interaksi langsung dengan material limbah memperdalam pemahaman sains siswa.',
    keyFindings: [
      'Membuktikan ecobrick meningkatkan literasi sains dan pemahaman konsep massa-volume.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-014',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title: 'Inovasi ecobrick sebagai upaya pengurangan sampah plastik',
    authors:
      'Budiman, B., Yuliyani, Y., Sabrina, A. B., Maharani, M., Lubis, I. R., & Indriani, D.',
    year: 2024,
    source: 'Jurnal Pengabdian Kolaborasi dan Inovasi IPTEKS, 2(5)',
    citationCode: '[REF-014]',
    doiOrUrl: 'https://doi.org/10.59407/jpki2.v2i5.1398',
    abstractOrSummary:
      'Inovasi pemanfaatan limbah plastik menjadi produk bernilai guna dalam kerangka ekonomi sirkular.',
    keyFindings: [
      'Ecobrick memiliki manfaat praktis pengurangan limbah dan manfaat simbolis perubahan paradigma limbah.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-015',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title: 'Ecobrik sebagai media komunikasi lingkungan siswa SMAN 5 Bandar Lampung',
    authors: 'Carolina, T., Suhardi, S., & Saputra, D.',
    year: 2024,
    source: 'Jurnal Masyarakat Pengabdian, 3(2)',
    citationCode: '[REF-015]',
    doiOrUrl: 'https://doi.org/10.37090/jm-pkm.v3i2.1953',
    abstractOrSummary:
      'Peran siswa sebagai komunikator lingkungan melalui presentasi dan pameran modul ecobrick.',
    keyFindings: [
      'Siswa bertransformasi dari pelaksana proyek menjadi komunikator perubahan sosial di lingkungan sekolah.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-016',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title: 'Edukasi pengelolaan sampah plastik melalui sosialisasi dan pembuatan ecobrick',
    authors:
      'Muthi’uddin, A., Zainuddin, M., Afiktaputra, M. A., Wijayanti, A. D., & Setyo, S. D.',
    year: 2025,
    source: 'Jurnal Ilmu Lingkungan dan Pendidikan (JILPI), 4(2)',
    citationCode: '[REF-016]',
    doiOrUrl: 'https://doi.org/10.57248/jilpi.v4i2.675',
    abstractOrSummary:
      'Sosialisasi partisipatif pembuatan ecobrick dalam mengelola timbulan sampah anorganik.',
    keyFindings: [
      'Pelatihan terstruktur meningkatkan keterampilan motorik dan kesadaran pilah sampah peserta didik.',
    ],
    relevanceRating: 'Supporting',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-017',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Penerapan model pembelajaran project based learning melalui kegiatan membuat ecobrick untuk meningkatkan kesadaran peduli lingkungan siswa',
    authors: 'Sakti Jaya, A. W., Sahabuddin, E. S., & Irfan, M.',
    year: 2025,
    source: 'Jurnal Dikdas / Jurnal Dedikasi Sains, 12(1)',
    citationCode: '[REF-017]',
    doiOrUrl: 'https://doi.org/10.22487/jds.v12i1.4879',
    abstractOrSummary:
      'Penerapan PjBL ecobrick yang menunjukkan efektivitas tinggi dalam meningkatkan kesadaran lingkungan.',
    keyFindings: [
      'Tingkat kesadaran lingkungan siswa mencapai 87% setelah penyelesaian proyek ecobrick terpadu.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-018',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title:
      'Pelatihan ecobrick sebagai upaya peningkatan kesadaran pengelolaan sampah plastik pada anak sekolah dasar di Sanggar Literasi Ranggi Deli Serdang',
    authors:
      'Sihombing, C., Darmayana, Z., Gultom, E. A., Silalahi, J., Diba, A. F., Rasenda, Hani, N., Lubis, Z. H., Saputri, E., Ariani, D., Kurniawan, F., & Handika, T. A.',
    year: 2026,
    source: 'Hijm, 4(3)',
    citationCode: '[REF-018]',
    doiOrUrl: 'https://doi.org/10.54373/hijm.v4i3.5611',
    abstractOrSummary:
      'Pelatihan ecobrick komunitas literasi anak dalam mengalihkan limbah kemasan makanan menjadi kursi dan meja santai.',
    keyFindings: [
      'Aktivitas kelompok ecobrick menumbuhkan habituasi peduli kebersihan ruang belajar.',
    ],
    relevanceRating: 'Supporting',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-019',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title:
      'Ecobrick workshop to strengthen plastic waste management literacy among primary and lower secondary students',
    authors: 'Sofyan, S., Ramadhany, A., Ferdhiyadi, F., & Usman, A.',
    year: 2025,
    source: 'Sipakatau, 3(1)',
    citationCode: '[REF-019]',
    doiOrUrl: 'https://doi.org/10.66314/sipakatau.v3i1.266',
    abstractOrSummary:
      'Workshop ecobrick dalam menguatkan literasi pengelolaan sampah bagi siswa SD dan SMP.',
    keyFindings: [
      'Peningkatan pemahaman klasifikasi plastik LDPE, HDPE, dan PP pada siswa sekolah.',
    ],
    relevanceRating: 'Supporting',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-020',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title:
      'Pelatihan pengelolaan sampah plastik menjadi ecobrick sebagai media edukasi lingkungan berkelanjutan di SMPN 3 Tersono, Kabupaten Batang',
    authors: 'Sunandar, M.',
    year: 2025,
    source: 'Jurnal Pengabdian Sosial, 9(3)',
    citationCode: '[REF-020]',
    doiOrUrl: 'https://doi.org/10.23960/jss.v9i3.612',
    abstractOrSummary:
      'Program edukasi lingkungan berkelanjutan melalui ecobrick di tingkat sekolah menengah.',
    keyFindings: [
      'Membuktikan pelatihan ecobrick memperkuat rasa tanggung jawab siswa terhadap timbulan sampah harian.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-021',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title: 'Transforming plastic waste into ecobricks: Case study at MAS Al Hidayah, Serang Regency',
    authors: 'Sunaryo, D., Adiyanto, Y., Darmawan, D. I., Hamdan, H., & Firdaus, A.',
    year: 2025,
    source: 'Fundamentum, 3(2)',
    citationCode: '[REF-021]',
    doiOrUrl: 'https://doi.org/10.62383/fundamentum.v3i2.743',
    abstractOrSummary:
      'Studi kasus transformasi sampah plastik menjadi ecobrick pada madrasah aliyah swasta.',
    keyFindings: [
      'Replikasi ecobrick di lingkungan madrasah aliyah berhasil mengonversi ratusan kilogram sampah anorganik santri.',
    ],
    relevanceRating: 'Supporting',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-022',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title: 'Sosialisasi dan pemanfaatan limbah plastik sebagai pagar ecobrick di SDN 13 Mataram',
    authors:
      'Wartiandani, E. P., Darajat, B. Z., Restati, F. M., Ijtihad, G., Rizki, S., & Hasnawati, H.',
    year: 2025,
    source: 'Dedikasi Cendekia, 2(2)',
    citationCode: '[REF-022]',
    doiOrUrl: 'https://doi.org/10.66653/dedikasicendekia.v2i2.53',
    abstractOrSummary:
      'Pemanfaatan ecobrick sebagai pagar tanaman hias di sekolah dasar wilayah Kota Mataram.',
    keyFindings: [
      'Konteks lokal Kota Mataram: ecobrick terbukti aplikabel untuk estetika lingkungan sekolah dasar dan menengah.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-023',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title:
      'Ecobrick goes to school: Pelatihan mengolah sampah plastik berbasis sekolah Adiwiyata di SMP Negeri 25 Malang',
    authors:
      'Yani, N. L. S., Zakaria, M., Sulistia, N., Aprillaili, R. V., Anggraini, R. T., Amalinda, R., Hartono, S., Noviandari, T., & Anas, Z. N.',
    year: 2024,
    source: 'Jurnal Abdimas Bina Bangsa, 5(1)',
    citationCode: '[REF-023]',
    doiOrUrl: 'https://doi.org/10.46306/jabb.v5i1.1063',
    abstractOrSummary:
      'Program ecobrick terstruktur dalam mendukung pencapaian indikator Adiwiyata mandiri.',
    keyFindings: [
      'Pemanfaatan ecobrick meningkatkan keterlibatan siswa dalam aksi nyata pelestarian lingkungan sekolah.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-024',
    workspaceId: 'sample-ws',
    type: 'DATASET',
    title:
      'Ecobrick implementation in school plastic waste management: Meta-analysis and synthesis report',
    authors: 'Consensus NLP, Inc. & Elicit',
    year: 2026,
    source: 'Consensus.app & Elicit.com AI Synthesis Repository',
    citationCode: '[REF-024]',
    abstractOrSummary:
      'Dataset meta-analisis dan sintesis bukti akademis mengenai efektivitas ecobrick dalam intervensi pendidikan lingkungan global dan nasional.',
    keyFindings: [
      'Membuktikan konsensus riset bahwa ecobrick efektif menutup knowledge-action gap jika didukung habituasi keluarga.',
      'Memberikan pemetaan novelty riset menuju kurikulum berkelanjutan masa depan.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-025',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Ecoliteracy in utilizing plastic waste to ecobrick through project based learning on social studies learning',
    authors: 'Rahmawati, A.',
    year: 2019,
    source: 'International Journal of Pedagogy of Social Studies, 4(2)',
    citationCode: '[REF-025]',
    doiOrUrl: 'https://doi.org/10.17509/ijposs.v4i2.21504',
    abstractOrSummary:
      'Penelitian tindakan kelas (PTK) tiga siklus di SMP Indonesia yang mengintegrasikan pembuatan ecobrick ke dalam pembelajaran IPS berbasis proyek (PjBL) untuk meningkatkan ecoliteracy siswa.',
    keyFindings: [
      'Tingkat ecoliteracy siswa meningkat secara progresif dari kategori kurang, cukup, hingga baik melalui tiga siklus tindakan.',
      'PjBL ecobrick mengontekstualisasikan masalah sampah plastik menjadi aksi nyata yang bermakna bagi peserta didik.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-026',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Ecobricks creation for preschool children: Sustainable Development Goals 2030',
    authors: 'Nurjanah, N. E., Yetti, E., & Sumantri, M. S.',
    year: 2025,
    source: 'IOP Conference Series: Earth and Environmental Science, 1438(1), 012037',
    citationCode: '[REF-026]',
    doiOrUrl: 'https://doi.org/10.1088/1755-1315/1438/1/012037',
    abstractOrSummary:
      'Studi naratif mengenai pengenalan ecobrick pada anak usia dini sebagai sarana edukasi pengelolaan limbah plastik dan stimulasi kepedulian lingkungan sejalan dengan target SDGs 2030.',
    keyFindings: [
      'Pembuatan ecobrick efektif mengenalkan pemilahan sampah, kepedulian lingkungan, kreativitas, dan keterampilan berpikir kritis sejak usia prasekolah.',
      'Menekankan pentingnya pendampingan orang dewasa dalam memastikan keamanan dan kebermaknaan aktivitas.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-027',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Education of Waste Management Based on Zero Waste in Kendal District (Case Study: Waste Recycling Craft Community (Kerdus), Kendal District, Central Java)',
    authors: 'Hidayati, N., Hajar, N., & Setiyanto, F.',
    year: 2021,
    source: 'IOP Conference Series: Earth and Environmental Science, 755(1), 012077',
    citationCode: '[REF-027]',
    doiOrUrl: 'https://doi.org/10.1088/1755-1315/755/1/012077',
    abstractOrSummary:
      'Studi kasus kualitatif fenomenologis mengenai program edukasi pengelolaan sampah berbasis zero-waste dan upcycling ecobrick di komunitas.',
    keyFindings: [
      'Sebanyak 76% peserta berhasil menerapkan praktik 3R (Reduce, Reuse, Recycle) dalam kehidupan sehari-hari pasca-pelatihan ecobrick.',
      'Pelatihan komprehensif mengubah persepsi limbah plastik dari beban buangan menjadi aset material berdaya guna.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-028',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title: 'Model Garden Literation Based Ecobrick',
    authors: 'Suhendri, E., Saam, Z., Suprayogi, I., & Chairilsyah, D.',
    year: 2021,
    source: 'Degres, 20(1), 126–133',
    citationCode: '[REF-028]',
    doiOrUrl: 'https://doi.org/10.1877/degres.v20i1.49',
    abstractOrSummary:
      'Studi deskriptif-kualitatif yang merancang model taman literasi sekolah berbasis ecobrick sebagai solusi praktis pengelolaan sampah plastik di 45 sekolah (konteks estimasi 30.639 siswa).',
    keyFindings: [
      'Ecobrick terbukti sangat layak secara material dan fungsional untuk konstruksi modular taman literasi sekolah.',
      'Mengintegrasikan reduksi sampah sekolah dengan sarana peningkatan minat baca siswa.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-029',
    workspaceId: 'sample-ws',
    type: 'COMMUNITY_REPORT',
    title:
      'Ecobrick as a smart solution for utilizing plastic and cloth waste in Jakarta',
    authors: 'Yusuf, Y., Sukmawati, W., & Riyanti, H. B.',
    year: 2020,
    source: 'Journal of Community Services and Empowerment, 1(3), 114–120',
    citationCode: '[REF-029]',
    doiOrUrl: 'https://doi.org/10.22219/jcse.v1i3.12250',
    abstractOrSummary:
      'Pemberdayaan masyarakat dalam mengolah kombinasi limbah plastik anorganik dan sisa kain perca menjadi modul furnitur ecobrick bernilai ekonomis dan estetis.',
    keyFindings: [
      'Ecobrick menjadi solusi pintar dan murah mereduksi timbulan sampah anorganik perkotaan padat penduduk.',
      'Meningkatkan keterampilan vokasional dan kebersamaan komunitas.',
    ],
    relevanceRating: 'Supporting',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-030',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      "Enhancing children's environmental cognition, affect, and behavior through project-based STEM learning toward the SDGs",
    authors:
      'Al-Barakat, A., Alali, R., Al-Hosan, A., Alghamdi, M., Abdullatif, A. K., & Zaher, A.',
    year: 2026,
    source: 'Frontiers in Psychology, 17, 1880850',
    citationCode: '[REF-030]',
    doiOrUrl: 'https://doi.org/10.3389/fpsyg.2026.1880850',
    abstractOrSummary:
      'Studi kuasi-eksperimental dan kualitatif intervensi pembelajaran STEM berbasis proyek terstruktur yang mengukur ranah kognitif, afektif, dan perilaku pro-lingkungan anak terkait target SDGs.',
    keyFindings: [
      'Pembelajaran berbasis proyek (PjBL-STEM) secara signifikan mengungguli pengajaran konvensional di seluruh domain kognitif, afektif, dan psikomotorik.',
      'Siswa secara aktif mentranslasikan pemahaman kelas menjadi kebiasaan keberlanjutan dalam rutinitas harian.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-031',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title: 'Project-based Learning for Environmental Sustainability Action',
    authors:
      'Bramwell-Lalor, S., Kelly, K., Ferguson, T., Gentles, C. H., & Roofe, C.',
    year: 2020,
    source: 'Southern African Journal of Environmental Education, 36(1), 10',
    citationCode: '[REF-031]',
    doiOrUrl: 'https://doi.org/10.4314/sajee.v36i1.10',
    abstractOrSummary:
      'Analisis Education for Sustainable Development (ESD) mengenai peran PjBL dalam menumbuhkan kompetensi keberlanjutan holistik pada siswa dan guru.',
    keyFindings: [
      'PjBL memfasilitasi 4 kompetensi kunci keberlanjutan: kolaborasi, berpikir kritis, kesadaran diri, dan komunikasi solutif.',
      'Mendorong motivasi intrinsik guru dan siswa untuk mengambil aksi pro-lingkungan nyata.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-032',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Evaluating Three Dimensions of Environmental Knowledge and Their Impact on Behaviour',
    authors: 'Braun, T., & Dierkes, P.',
    year: 2019,
    source: 'Research in Science Education, 49, 1–19',
    citationCode: '[REF-032]',
    doiOrUrl: 'https://doi.org/10.1007/s11165-017-9658-7',
    abstractOrSummary:
      'Evaluasi empiris mengenai tiga dimensi pengetahuan lingkungan (system knowledge, action-related knowledge, dan effectiveness knowledge) serta korelasinya dengan tindakan nyata.',
    keyFindings: [
      'Program aksi langsung menghasilkan peningkatan berkelanjutan pada ketiga dimensi pengetahuan dan memicu aksi pro-lingkungan.',
      'Pengetahuan sistem saja memiliki korelasi lemah dengan perilaku langsung, membuktikan adanya knowledge-action gap yang membutuhkan intervensi berbasis aksi.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-033',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title: 'The project-based learning approach in environmental education',
    authors: 'Genç, M.',
    year: 2015,
    source:
      'International Research in Geographical and Environmental Education, 24(2), 105–117',
    citationCode: '[REF-033]',
    doiOrUrl: 'https://doi.org/10.1080/10382046.2014.993169',
    abstractOrSummary:
      'Penelitian efektivitas pendekatan Project-Based Learning dalam pendidikan lingkungan calon guru dalam meningkatkan sikap dan kompetensi riset.',
    keyFindings: [
      'PjBL memperbaiki sikap lingkungan, mendorong kreativitas, memperjelas identifikasi masalah lokal, dan menumbuhkan partisipasi aktif dalam merumuskan solusi.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-034',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Roles of Environmental System Knowledge in Promoting University Students’ Environmental Attitudes and Pro-Environmental Behaviors',
    authors: 'Janmaimool, P., & Khajohnmanee, S.',
    year: 2019,
    source: 'Sustainability, 11(16), 4270',
    citationCode: '[REF-034]',
    doiOrUrl: 'https://doi.org/10.3390/su11164270',
    abstractOrSummary:
      'Investigasi peran pengetahuan sistem dalam mendorong sikap dan perilaku pro-lingkungan privat vs publik.',
    keyFindings: [
      'Kuliah formal meningkatkan sikap dan perilaku dampak tidak langsung, tetapi perilaku langsung (pemilahan sampah dan daur ulang) sangat bergantung pada norma pribadi, motivasi, dan fasilitas.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-035',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      "Improvement impact of nudges incorporated in environmental education on students' environmental knowledge, attitudes, and behaviors",
    authors:
      'Kurokawa, H., Igei, K., Kitsuki, A., Kurita, K., Managi, S., Nakamuro, M., & Sakano, A.',
    year: 2022,
    source: 'Journal of Environmental Management, 325(Pt B), 116612',
    citationCode: '[REF-035]',
    doiOrUrl: 'https://doi.org/10.1016/j.jenvman.2022.116612',
    abstractOrSummary:
      'Uji coba lapangan pemberian intervensi nudges dalam pendidikan lingkungan untuk menguji elastisitas perilaku berbiaya rendah vs berbiaya tinggi.',
    keyFindings: [
      'Perilaku rendah biaya (misal menolak tisu basah gratis) lebih cepat berubah dibandingkan perilaku berbiaya tinggi (berhenti membeli botol plastik kemasan), menegaskan perlunya infrastruktur pendukung.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-036',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Using the theory of planned behavior to identify key beliefs underlying pro-environmental behavior in high-school students: Implications for educational interventions',
    authors: 'de Leeuw, A., Valois, P., Ajzen, I., & Schmidt, P.',
    year: 2015,
    source: 'Journal of Environmental Psychology, 42, 128–138',
    citationCode: '[REF-036]',
    doiOrUrl: 'https://doi.org/10.1016/j.jenvp.2015.03.005',
    abstractOrSummary:
      'Survei longitudinal berbasis TPB pada siswa SMA untuk mengidentifikasi keyakinan kontrol perilaku kunci dalam intervensi pendidikan.',
    keyFindings: [
      'Sikap siswa SMA umumnya sudah positif, sehingga intervensi paling efektif harus berfokus pada keyakinan kontrol (perceived behavioral control) seperti tempat sampah pilah di rumah dan panduan praktis.',
      'Dukungan dan teladan orang tua merupakan faktor penentu stabilitas norma subjektif.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-037',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Environmental Education, Knowledge, and High School Students’ Intention toward Separation of Solid Waste on Campus',
    authors: 'Liao, C., & Li, H.',
    year: 2019,
    source:
      'International Journal of Environmental Research and Public Health, 16(9), 1659',
    citationCode: '[REF-037]',
    doiOrUrl: 'https://doi.org/10.3390/ijerph16091659',
    abstractOrSummary:
      'Penerapan model TPB yang diperluas pada 562 siswa SMA untuk mengukur prediktor intensi pemilahan sampah padat di lingkungan kampus/sekolah.',
    keyFindings: [
      'Pengetahuan lingkungan terbukti menjadi prediktor terkuat dalam menentukan niat pemilahan sampah pada siswa sekolah menengah.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-038',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Green Awareness in Action—How Energy Conservation Action Forces on Environmental Knowledge, Values and Behaviour in Adolescents’ School Life',
    authors: 'Maurer, M., Koulouris, P., & Bogner, F.',
    year: 2020,
    source: 'Sustainability, 12(3), 955',
    citationCode: '[REF-038]',
    doiOrUrl: 'https://doi.org/10.3390/su12030955',
    abstractOrSummary:
      'Proyek sekolah GAIA di Yunani yang meneliti dampak aksi konservasi terhadap pengetahuan aksi, nilai lingkungan, dan perilaku remaja.',
    keyFindings: [
      'Aksi nyata di sekolah meningkatkan pengetahuan efektivitas dan menurunkan nilai utilitarian (eksploitatif), di mana siswa dengan pengetahuan awal rendah mengalami lonjakan tertinggi.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-039',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Utilizing project-based learning to increase sustainability attitudes among students',
    authors: 'Perrault, E. K., & Albert, C. A.',
    year: 2017,
    source: 'Applied Environmental Education & Communication, 17(2), 96–105',
    citationCode: '[REF-039]',
    doiOrUrl: 'https://doi.org/10.1080/1533015x.2017.1366882',
    abstractOrSummary:
      'Studi empiris penggunaan PjBL dalam mendorong peningkatan sikap keberlanjutan dan keterlibatan aktif peserta didik.',
    keyFindings: [
      'PjBL terbukti secara signifikan meningkatkan sikap keberlanjutan dan rasa kepemilikan solusi lingkungan pada siswa.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-040',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'What Works for Whom? Investigating Adolescents’ Pro-Environmental Behaviors',
    authors: 'Poškus, M. S.',
    year: 2020,
    source: 'Sustainability, 12(18), 7313',
    citationCode: '[REF-040]',
    doiOrUrl: 'https://doi.org/10.3390/su12187313',
    abstractOrSummary:
      'Survei klaster pada 863 remaja mengenai variasi pola TPB berdasarkan tipe kepribadian dan jenis perilaku pro-lingkungan.',
    keyFindings: [
      'Pola pembentukan perilaku pro-lingkungan berbeda menurut profil psikologis siswa; pendekatan intervensi harus variatif dan mencakup stimulasi kelompok serta refleksi mandiri.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-041',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Educating for the future: How higher education in environmental management affects pro-environmental behaviour',
    authors:
      'Suárez‐Perales, I., Valero‐Gil, J., La Hiz, D. L. I., Rivera‐Torres, P., & Garcés‐Ayerbe, C.',
    year: 2021,
    source: 'Journal of Cleaner Production, 313, 128972',
    citationCode: '[REF-041]',
    doiOrUrl: 'https://doi.org/10.1016/j.jclepro.2021.128972',
    abstractOrSummary:
      'Eksperimen pendidikan lingkungan yang membuktikan jalur mediasi knowledge-concern-willingness dalam mengatasi kendala perubahan perilaku.',
    keyFindings: [
      'Pendidikan lingkungan memengaruhi perilaku melalui jalur tidak langsung: Pengetahuan → Kepedulian Afektif → Kesediaan Bertindak (Willingness to Act).',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-042',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Understanding Waste Management Behavior Among University Students in China: Environmental Knowledge, Personal Norms, and the Theory of Planned Behavior',
    authors: 'Wu, L., Zhu, Y., & Zhai, J.',
    year: 2022,
    source: 'Frontiers in Psychology, 12, 771723',
    citationCode: '[REF-042]',
    doiOrUrl: 'https://doi.org/10.3389/fpsyg.2021.771723',
    abstractOrSummary:
      'Survei cross-sectional pada 434 responden yang menggabungkan TPB, norma pribadi, dan pengetahuan lingkungan dalam memprediksi perilaku pengelolaan sampah.',
    keyFindings: [
      'Norma subjektif, kontrol perilaku terpersepsi, norma pribadi, dan pengetahuan memprediksi perilaku pemilahan sampah secara signifikan, di mana pengetahuan bekerja secara tidak langsung melalui kepedulian dan norma pribadi.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-043',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Pro-environmental behaviors through the lens of the theory of planned behavior: A scoping review',
    authors:
      'Yuriev, A., Dahmen, M., Paillé, P., Boiral, O., & Guillaumie, L.',
    year: 2020,
    source: 'Resources, Conservation and Recycling, 155, 104660',
    citationCode: '[REF-043]',
    doiOrUrl: 'https://doi.org/10.1016/j.resconrec.2019.104660',
    abstractOrSummary:
      'Tinjauan pelingkup (scoping review) komprehensif terhadap 126 publikasi ilmiah mengenai penerapan TPB dalam perilaku pro-lingkungan.',
    keyFindings: [
      'Menyoroti inkonsistensi jika TPB diterapkan tanpa mempertimbangkan kendala struktural praktis dan konteks sosial budaya spesifik peserta didik.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'ref-044',
    workspaceId: 'sample-ws',
    type: 'JOURNAL',
    title:
      'Greening due to environmental education? Environmental knowledge, attitudes, consumer behavior and everyday pro-environmental activities of Hungarian high school and university students',
    authors: 'Zsóka, Á., Szerényi, Z., Széchy, A., & Kocsis, T.',
    year: 2013,
    source: 'Journal of Cleaner Production, 48, 126–138',
    citationCode: '[REF-044]',
    doiOrUrl: 'https://doi.org/10.1016/j.jclepro.2012.11.030',
    abstractOrSummary:
      'Studi hubungan intensitas pendidikan lingkungan terhadap pengetahuan, sikap konsumsi berkelanjutan, dan tindakan harian pada siswa SMA dan mahasiswa.',
    keyFindings: [
      'Intensitas pendidikan berkorelasi kuat dengan pengetahuan dan sikap, tetapi pembentukan tindakan harian membutuhkan pembiasaan keluarga dan rutinitas terpandu.',
    ],
    relevanceRating: 'High',
    uploadedAt: new Date().toISOString(),
  },
];

export const SAMPLE_NOTES: ResearchNote[] = [
  {
    id: 'note-001',
    workspaceId: 'sample-ws',
    title: '5 Dimensi Ecobrick Sustainable Learning Framework (ESLF)',
    content:
      '1. Audit Limbah (Identifikasi kuantitatif masalah)\n2. Inkuiri Pedagogis via PjBL (Pembelajaran aktif berbasis proyek)\n3. Transformasi Literasi (Ecoliteracy & literasi sistem)\n4. Habituasi Perilaku & Dukungan Domestik (Sinergi orang tua di rumah)\n5. Kemandirian Institusional (Integrasi ke Adiwiyata & kebijakan sekolah).',
    tags: ['ESLF', 'Metodologi', 'Rekayasa Pedagogis'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'note-002',
    workspaceId: 'sample-ws',
    title: 'Standar Teknis Botol 330 ml & Ambang Densitas 0.33 g/ml',
    content:
      'Sesuai bab 2.1 KTI dan panduan BRIDA Kota Mataram 2026, botol PET mini 330 ml memerlukan massa plastik minimal 110 gram (110 / 330 = 0.333 g/ml). Nilai ini wajib dipenuhi agar botol stabil secara struktural dan tidak mudah deformasi saat digunakan sebagai partisi atau modul taman.',
    tags: ['Standar Teknis', 'Densitas', 'BRIDA 2026', 'Botol 330ml'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'note-003',
    workspaceId: 'sample-ws',
    title: 'Sintesis Teori Perilaku: Integrasi TPB dan VBN',
    content:
      'Theory of Planned Behavior (TPB) memetakan sikap, norma subjektif, dan kontrol perilaku di sekolah. Value-Belief-Norm (VBN) memetakan nilai biosferik dan norma moral pribadi di rumah. Keterlibatan orang tua sebagai mitra pedagogis memperkuat norma subjektif sekaligus norma pribadi siswa.',
    tags: ['TPB', 'VBN', 'Sinergi Orang Tua', 'Sidang Juri'],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'note-004',
    workspaceId: 'sample-ws',
    title: 'Sintesis Bukti Empiris Ecobrick & Upcycling di Sekolah',
    content:
      'Bukti langsung ecobrick di sekolah:\n• Rahmawati (2019): PjBL ecobrick menaikkan ecoliteracy siswa SMP bertahap dari rendah → cukup → baik dalam 3 siklus tindakan.\n• Nurjanah et al. (2025): Pengenalan ecobrick pada anak usia dini menstimulasi pemilahan sampah dan kepedulian lingkungan sejalan SDGs 2030.\n• Hidayati et al. (2021): 76% peserta menerapkan prinsip 3R pasca-pelatihan ecobrick/zero waste.\n• Suhendri et al. (2021): Kelayakan taman literasi ecobrick dievaluasi pada 45 sekolah (30.639 siswa) sebagai solusi limbah plastik terapan.\n• Yusuf et al. (2020): Solusi cerdas pengolahan plastik & kain perca di perkotaan.',
    tags: ['Ecobrick', 'Ecoliteracy', 'Sintesis Literatur', 'PjBL'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'note-005',
    workspaceId: 'sample-ws',
    title: 'Dekonstruksi Knowledge–Action Gap melalui PjBL & Experiential Learning',
    content:
      'Mengapa pengetahuan saja tidak cukup melahirkan aksi lingkungan?\n• Braun & Dierkes (2019): Pengetahuan sistem memiliki korelasi lemah dengan perilaku langsung jika tidak diimbangi action-related & effectiveness knowledge.\n• Al-Barakat et al. (2026): Proyek STEM terstruktur mengungguli instruksi tradisional di ketiga ranah (kognitif, afektif, perilaku).\n• Bramwell-Lalor et al. (2020) & Genç (2015): PjBL membangun kompetensi keberlanjutan holistik (kritis, kolaboratif, inisiatif).\n• Kurokawa et al. (2022): Tindakan berbiaya rendah (refusal wet wipes) mudah berubah dengan edukasi, sedangkan tindakan konsumsi botol memerlukan rekayasa pedagogis berkelanjutan (ESLF).\n• Suárez-Perales et al. (2021): Pengetahuan harus melalui mediasi Kepedulian Afektif → Kesediaan Bertindak.',
    tags: ['Knowledge-Action Gap', 'PjBL', 'Experiential Learning', 'ESLF'],
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'note-006',
    workspaceId: 'sample-ws',
    title: 'Prediktor TPB, VBN, dan Peran Kemitraan Keluarga',
    content:
      'Temuan kunci penelitian perilaku siswa:\n• de Leeuw et al. (2015): Pada siswa SMA, sikap umumnya sudah positif. Tuas intervensi paling efektif adalah keyakinan kontrol (perceived behavioral control) seperti tempat sampah pilah di rumah dan bimbingan orang tua.\n• Liao & Li (2019): Pengetahuan spesifik memprediksi 562 niat pemilahan sampah siswa secara signifikan.\n• Wu et al. (2022): Norma subjektif & norma pribadi memediasi perilaku pengelolaan sampah.\n• Maurer et al. (2020) & Zsóka et al. (2013): Nilai biosferik dan intensitas pendidikan membutuhkan penguatan domestik di rumah agar menjadi karakter permanen.\n• Poškus (2020) & Yuriev et al. (2020): Perlu diferensiasi intervensi dan penyediaan sarana struktural.',
    tags: ['TPB', 'VBN', 'Family Context', 'Perceived Behavioral Control'],
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export function createSampleExperiments(workspaceId: string): Experiment[] {
  const bottle330 = STANDARD_BOTTLES[0]; // 330 ml
  const bottle500 = STANDARD_BOTTLES[1]; // 500 ml
  const bottle600 = STANDARD_BOTTLES[2]; // 600 ml

  // Trial 01: Botol 330 ml (Standar KTI 115g -> densitas 0.3485 g/ml)
  const exp01Density = calculateDensity(115.0, bottle330.nominalVolume);
  const exp01Cls = classifyEcobrick(exp01Density);

  const exp01: Experiment = {
    id: `exp_${workspaceId}_01`,
    workspaceId,
    trialNumber: 1,
    title: 'Trial 01: Verifikasi Standar Teknis Botol PET Mini 330 ml (Massa Target > 110g)',
    objective:
      'Membuktikan pencapaian ambang batas densitas minimal 0.33 g/ml pada botol 330 ml sesuai kajian bab 2.1 naskah KTI MA Plus Abu Hurairah.',
    hypothesis:
      'Pemadatan bertahap limbah plastik kantong dan bungkus kering ke botol 330 ml akan menghasilkan massa di atas 110 g (densitas > 0.33 g/ml).',
    bottle: bottle330,
    materials: [
      {
        id: 'mat-01a',
        name: 'Plastik Kemasan Kantin & Bekal Siswa (Bersih Kering)',
        category: 'MIXED',
        mass: 115.0,
        preparation: 'chopped',
        cleanliness: 'washed_dry',
        color: '#10b981',
      },
    ],
    variables: [
      {
        id: 'var-1',
        type: 'INDEPENDENT',
        name: 'Metode Pemadatan Bertahap',
        description: 'Penekanan dengan tongkat kayu per lapis 3 cm',
        valueOrUnit: '30 siklus tusuk per lapis',
      },
      {
        id: 'var-2',
        type: 'DEPENDENT',
        name: 'Densitas Volumetrik Akhir',
        description: 'Massa bersih / Volume 330 ml',
        valueOrUnit: 'g/ml (Target >= 0.33)',
      },
      {
        id: 'var-3',
        type: 'CONTROLLED',
        name: 'Jenis Botol & Tara',
        description: 'Botol PET 330 ml bersih',
        valueOrUnit: '330 ml, tara 16.0 g',
      },
    ],
    measurements: [
      {
        id: 'meas-01',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        grossMass: 131.0,
        tareMass: 16.0,
        netMass: 115.0,
        volume: 330,
        density: exp01Density,
        compactionFactor: 79,
        heightFilled: 17.5,
        hardnessIndex: 7.8,
        standardMet: exp01Cls.standardMet,
        classification: exp01Cls.classification,
      },
    ],
    observations: [
      {
        id: 'obs-01',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        note: 'Dasar botol 330 ml terisi rapat. Tidak ada rongga udara kosong pada lekukan bawah. Botol tidak mengalami deformasi.',
        layerLevel: 'bottom',
        observedColor: '#10b981',
        voidDetected: false,
        compressionResistance: 'firm',
      },
    ],
    procedureSteps: [
      'Cuci bersih dan keringkan sampah plastik kemasan kantin',
      'Siapkan botol PET 330 ml dan timbang massa kosong (tara 16 g)',
      'Gunting plastik menjadi potongan 2 cm',
      'Masukkan plastik sedikit demi sedikit dan tekan dengan tongkat kayu',
      'Pastikan massa total mencapai minimal 126 g (bersih 110 g) lalu tutup rapat',
    ],
    currentStepIndex: 5,
    stickCompressionCycles: 45,
    status: 'COMPLETED',
    resultSummary:
      'Massa bersih 115.0 g pada botol 330 ml menghasilkan densitas 0.3485 g/ml (Lolos Standar BRIDA & GEA > 0.33 g/ml).',
    aiAnalysis:
      'Percobaan Trial 01 berhasil memvalidasi standar teknis KTI pada botol 330 ml. Kepadatan 0.3485 g/ml berada di atas ambang batas minimal kelayakan struktural.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  };

  // Trial 02: Botol 500 ml (Massa 190g -> densitas 0.3800 g/ml)
  const exp02Density = calculateDensity(190.0, bottle500.nominalVolume);
  const exp02Cls = classifyEcobrick(exp02Density);

  const exp02: Experiment = {
    id: `exp_${workspaceId}_02`,
    workspaceId,
    trialNumber: 2,
    title: 'Trial 02: Pengujian PjBL Siswa pada Botol 500 ml dengan Kombinasi Plastik Domestik',
    objective:
      'Mengevaluasi hasil pemadatan siswa melalui penugasan PjBL menggunakan sampah plastik terpilah dari sekolah dan rumah.',
    hypothesis:
      'Sinergi pemilahan plastik domestik rumah tangga dengan bimbingan PjBL sekolah menghasilkan ecobrick densitas optimal (>0.37 g/ml).',
    bottle: bottle500,
    materials: [
      {
        id: 'mat-02a',
        name: 'Plastik LDPE Kemasan Rumah Tangga',
        category: 'LDPE',
        mass: 95.0,
        preparation: 'strips',
        cleanliness: 'washed_dry',
        color: '#60a5fa',
      },
      {
        id: 'mat-02b',
        name: 'Plastik BOPP Snack Sekolah',
        category: 'BOPP',
        mass: 95.0,
        preparation: 'chopped',
        cleanliness: 'washed_dry',
        color: '#fbbf24',
      },
    ],
    variables: [
      {
        id: 'var-1',
        type: 'INDEPENDENT',
        name: 'Kombinasi Sumber Sampah',
        description: '50% Sampah Rumah + 50% Sampah Sekolah',
        valueOrUnit: 'Sinergi Domestik-Sekolah',
      },
      {
        id: 'var-2',
        type: 'DEPENDENT',
        name: 'Densitas Volumetrik',
        description: 'Massa per volume 500 ml',
        valueOrUnit: 'g/ml (target > 0.37)',
      },
      {
        id: 'var-3',
        type: 'CONTROLLED',
        name: 'Ukuran Botol',
        description: 'Botol PET 500 ml',
        valueOrUnit: '500 ml, tara 20g',
      },
    ],
    measurements: [
      {
        id: 'meas-02',
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        grossMass: 210.0,
        tareMass: 20.0,
        netMass: 190.0,
        volume: 500,
        density: exp02Density,
        compactionFactor: 84,
        heightFilled: 21.0,
        hardnessIndex: 8.6,
        standardMet: exp02Cls.standardMet,
        classification: exp02Cls.classification,
      },
    ],
    observations: [
      {
        id: 'obs-02',
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        note: 'Dinding botol sangat padat dan tidak melengkung saat ditekan. Interlocking plastik kemasan dan kantong film mereduksi void ratio.',
        layerLevel: 'middle',
        observedColor: '#34d399',
        voidDetected: false,
        compressionResistance: 'very_solid',
      },
    ],
    procedureSteps: [
      'Kumpulkan plastik dari kantin sekolah dan rumah siswa',
      'Lakukan audit limbah dan pencucian bersama keluarga di rumah',
      'Padatkan ke botol 500 ml dalam sesi PjBL di kelas',
      'Lakukan uji tekan manual dan pencatatan timbangan digital',
    ],
    currentStepIndex: 4,
    stickCompressionCycles: 60,
    status: 'COMPLETED',
    resultSummary:
      'Massa bersih 190.0 g menghasilkan densitas 0.3800 g/ml (Kategori Optimal Structural).',
    aiAnalysis:
      'Peningkatan densitas +9.0% membuktikan efektivitas PjBL dan sinergi domestik dalam mengumpulkan jenis plastik yang lebih beragam untuk pemadatan interlocking.',
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  };

  // Trial 03: Botol 600 ml (Massa 242g -> densitas 0.4033 g/ml)
  const exp03Density = calculateDensity(242.0, bottle600.nominalVolume);
  const exp03Cls = classifyEcobrick(exp03Density);

  const exp03: Experiment = {
    id: `exp_${workspaceId}_03`,
    workspaceId,
    trialNumber: 3,
    title: 'Trial 03: Modul Konstruksi Partisi Adiwiyata pada Botol Standar 600 ml',
    objective:
      'Menghasilkan modul ecobrick berkepadatan tinggi untuk aplikasi partisi taman sekolah Adiwiyata MA Plus Abu Hurairah.',
    hypothesis:
      'Integrasi cacahan mikro dan teknik pemadatan sudut terarah menghasilkan densitas > 0.40 g/ml yang kokoh untuk elemen arsitektur hijau.',
    bottle: bottle600,
    materials: [
      {
        id: 'mat-03a',
        name: 'Plastik Campuran Terpilah Kering',
        category: 'MIXED',
        mass: 242.0,
        preparation: 'chopped',
        cleanliness: 'washed_dry',
        color: '#059669',
      },
    ],
    variables: [
      {
        id: 'var-1',
        type: 'INDEPENDENT',
        name: 'Teknik Cacahan & Tekanan Tongkat',
        description: 'Cacahan 1-2 cm dengan kompresi 50N',
        valueOrUnit: 'Cacahan Mikro + 80 siklus',
      },
      {
        id: 'var-2',
        type: 'DEPENDENT',
        name: 'Densitas Volumetrik 600 ml',
        description: 'Massa bersih per 600 ml',
        valueOrUnit: 'g/ml (Target > 0.40)',
      },
      {
        id: 'var-3',
        type: 'CONTROLLED',
        name: 'Standar Botol PET 600 ml',
        description: 'Volume 600 ml, tara 24g',
        valueOrUnit: '600 ml, tara 24.0 g',
      },
    ],
    measurements: [
      {
        id: 'meas-03',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        grossMass: 266.0,
        tareMass: 24.0,
        netMass: 242.0,
        volume: 600,
        density: exp03Density,
        compactionFactor: 90,
        heightFilled: 23.0,
        hardnessIndex: 9.6,
        standardMet: exp03Cls.standardMet,
        classification: exp03Cls.classification,
      },
    ],
    observations: [
      {
        id: 'obs-03',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        note: 'Sangat keras menyerupai kayu solid. Tidak berongga saat diketuk dan stabil menahan beban injak tanpa deformasi.',
        layerLevel: 'top',
        observedColor: '#047857',
        voidDetected: false,
        compressionResistance: 'rigid',
      },
    ],
    procedureSteps: [
      'Pilah dan cacah plastik kemasan berukuran 1-2 cm',
      'Masukkan plastik dasar lembut pada lekukan kaki botol',
      'Padatkan secara gradual per batch 30 gram',
      'Ukur massa akhir dan pastikan melebihi 240 gram bersih',
      'Simpan di rak modul partisi sekolah Adiwiyata',
    ],
    currentStepIndex: 5,
    stickCompressionCycles: 85,
    status: 'COMPLETED',
    resultSummary:
      'Massa bersih 242.0 g menghasilkan densitas 0.4033 g/ml. Sangat kokoh dan memenuhi standar optimal modul sirkular.',
    aiAnalysis:
      'Performa densitas 0.4033 g/ml membuktikan kesiapan modul ecobrick untuk integrasi program Adiwiyata dan pertahanan sidang LKTI.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  };

  return [exp01, exp02, exp03];
}

export function createInitialWorkspaceState(workspaceId: string): WorkspaceState {
  const experiments = createSampleExperiments(workspaceId);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();

  return {
    metadata: {
      id: workspaceId,
      createdAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      expiresAt,
      version: 2,
      title: 'Workspace Riset KTI Ecobrick MA Plus Abu Hurairah',
      primaryResearchTitle: SAMPLE_KTI.title,
    },
    experiments,
    activeExperimentId: experiments[experiments.length - 1].id,
    notes: SAMPLE_NOTES,
    references: SAMPLE_REFERENCES,
    kti: SAMPLE_KTI,
    conversations: [
      {
        id: 'conv-001',
        workspaceId,
        title: 'Konsultasi Naskah KTI & Sinergi Pedagogis Sekolah-Keluarga',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        mode: 'ANALYST',
        messages: [
          {
            id: 'msg-01',
            role: 'user',
            content:
              'Bagaimana menghubungkan data eksperimen densitas botol 330 ml (115g, densitas 0.3485 g/ml) dengan teori TPB dan VBN dalam bab 4 KTI kami?',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: 'msg-02',
            role: 'assistant',
            content: `Berdasarkan naskah KTI resmi Anda (**"Pemanfaatan Ecobrick dalam Perspektif Rekayasa Pedagogis Berkelanjutan: Sinergi Sekolah dan Orang Tua Menuju Lingkungan Mandiri"**):

### 1. Hubungan Teknis ke Teori Perilaku (TPB & VBN)
* **Kepatuhan Standar Teknis:** Botol 330 ml mencapai massa 115.0 g → ρ = 0.3485 g/cm³, melampaui ambang batas minimal 0.33 g/cm³ yang disyaratkan dalam **[REF-001]** dan **[REF-002]** (BRIDA Kota Mataram 2026).
* **Dimensi TPB (*Perceived Behavioral Control*):** Ketika siswa berhasil memadatkan botol hingga mencapai standar kuantitatif terukur, rasa efikasi diri (*self-efficacy*) meningkat secara psikomotorik (merujuk **[REF-004]** de Leeuw et al., 2015).
* **Dimensi VBN (*Personal Norm Activation*):** Proses pemilahan sampah bersih-kering bersama orang tua di rumah menginternalisasi nilai biosferik menjadi norma moral pribadi (merujuk **[REF-007]** Liobikienė & Poškus, 2019).

### 2. Rekomendasi Argumen Sidang Juri LKTI
Sampaikan bahwa ecobrick dalam riset MA Plus Abu Hurairah bukan sekadar produk kerajinan tangan, melainkan **medium rekayasa pedagogis berkelanjutan (ESLF)** yang menutup *knowledge-action gap* (N-gain 0.61, **[REF-009]** Susilawati et al.; Kesadaran 87%, **[REF-017]** Sakti Jaya et al.).`,
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            citations: ['[REF-001]', '[REF-002]', '[REF-004]', '[REF-007]', '[REF-009]', '[REF-017]'],
            inferenceType: 'EVIDENCE_BASED',
            suggestedFollowUps: [
              'Bagaimana merumuskan 5 dimensi ESLF di hadapan dewan juri?',
              'Bagaimana peran orang tua dalam mempertahankan habituasi lingkungan?',
              'Apa signifikansi densitas 0.33 g/ml dalam botol 330 ml?',
            ],
          },
        ],
      },
    ],
    activeConversationId: 'conv-001',
    jurySessions: [],
    activeJurySessionId: null,
  };
}
