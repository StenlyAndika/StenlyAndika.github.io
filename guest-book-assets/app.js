function tampilkanTanggal() {
    const now = new Date();

    // Nama hari (Senin, Selasa, ...)
    const hari = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        timeZone: 'Asia/Jakarta'
    }).format(now);

    // Jam:Menit (24 jam, leading zero)
    const jam = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
    });

    // Tanggal lengkap dengan nama bulan (23 September 2025)
    const tgl = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    }).format(now);

    // Gabungkan
    const hasil = `${hari}, ${jam} - ${tgl}`;

    $('#tanggal').text(hasil);
}
$(document).ready(function() { tampilkanTanggal(); });

function guestBookWizard() {
    return {
        currentStep: 1,
        form: { bidang: '', nama: '', nowa: '', alamat: '', asal: '', keperluan: '' },
        isSubmitting: false,
        showSuccess: false,
        nextStep() { if (this.currentStep < 2 && this.form.bidang) this.currentStep++; },
        previousStep() { if (this.currentStep > 1) this.currentStep--; },

        checkPejabatStatus() {
            const warningBox = document.getElementById("warning-offline");
            if (!this.form.bidang || !pejabatInfo[this.form.bidang]) {
                warningBox.classList.add("hidden");
                return;
            }

            const pejabat = pejabatInfo[this.form.bidang];
            if (pejabat.status === "offline") {
                warningBox.textContent = `${pejabat.jabatan} sedang tidak hadir/tidak ada di ruangan.`;
                warningBox.classList.remove("hidden");
            } else {
                warningBox.classList.add("hidden");
            }
        },

        submitForm() {
            if (!this.form.nama || !this.form.alamat || !this.form.asal || !this.form.keperluan) return;
            this.isSubmitting = true;
            const today = new Date();
            const tgl = today.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            const entry = {
                tgl: tgl,
                bidang: this.form.bidang,
                nama: this.form.nama,
                nowa: this.form.nowa,
                alamat: this.form.alamat,
                asal: this.form.asal,
                keperluan: this.form.keperluan,
                status: "waiting"
            };

            const customId = crypto.randomUUID();

            fetch(`https://guest-book-a50a5-default-rtdb.asia-southeast1.firebasedatabase.app/guestBook/${customId}.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save");
                return res.json();
            })
            .then(data => {
                this.isSubmitting = false;
                this.showSuccess = true;
            })
            .catch(err => {
                console.error("Error:", err);
                this.isSubmitting = false;
            });
        },
        resetForm() {
            this.currentStep = 1;
            this.form = { bidang: '', nama: '', alamat: '', asal: '', keperluan: '' };
        }
    }
}

function guestBook() {
    return {
        step: 1,
        submitting: false,
        showSuccess: false,
        form: {
            bidang: '',
            nama: '',
            alamat: '',
            asal: '',
            keperluan: ''
        },

        get currentDate() {
            return new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        get isFormValid() {
            return this.form.nama && this.form.alamat && this.form.asal && this.form.keperluan;
        },

        officials: [
            { name: 'Kepala Dinas', available: false },
            { name: 'Kabid Keuangan', available: true },
            { name: 'Kabid Pemdes', available: true },
            { name: 'Kabid PM', available: false }
        ],

        departments: [
            { value: 'sekretariat', label: 'Sekretariat' },
            { value: 'keuaset', label: 'Bidang Keuangan dan Aset' },
            { value: 'pemdes', label: 'Bidang Pemerintahan Desa' },
            { value: 'pm', label: 'Bidang Pemberdayaan Masyarakat' }
        ],

        formFields: [
            { name: 'nama', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan nama lengkap' },
            { name: 'alamat', label: 'Alamat', type: 'text', placeholder: 'Alamat lengkap' },
            { name: 'asal', label: 'Asal Instansi/Desa', type: 'text', placeholder: 'Nama instansi atau desa' },
            { name: 'keperluan', label: 'Keperluan', type: 'textarea', placeholder: 'Jelaskan keperluan kunjungan...', rows: 4 }
        ],

        nextStep() {
            if (this.form.bidang) {
                this.step = 2;
            }
        },

        async submit() {
            if (!this.isFormValid || this.submitting) return;

            this.submitting = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.submitting = false;
            this.showSuccess = true;
        },

        reset() {
            this.step = 1;
            this.showSuccess = false;
            this.submitting = false;
            this.form = {
                bidang: '',
                nama: '',
                alamat: '',
                asal: '',
                keperluan: ''
            };
        }
    }
}

let pejabatInfo = {};

async function loadStatus() {
  try {
    const res = await fetch("https://guest-book-info-default-rtdb.asia-southeast1.firebasedatabase.app/guestBookInfo.json");
    const data = await res.json();

    pejabatInfo = {};

    const container = document.getElementById("status-container");
    container.innerHTML = "";

    // mapping bidang -> jabatan resmi
    const bidangMap = {
      sekretariat: "Kepala Dinas",
      keuaset: "Kepala Bidang Keuangan dan Aset",
      pemdes: "Kepala Bidang Pemerintahan Desa",
      pm: "Kepala Bidang Pemberdayaan Masyarakat"
    };

    Object.keys(data).forEach(key => {
      const pejabat = data[key];

      const isOnline = pejabat.status === "online";

      const statusColor = isOnline ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100";
      const dotColor = isOnline ? "bg-green-500" : "bg-red-500";
      const statusText = isOnline ? "Ada" : "Tidak Ada";
      const statusAtasan = isOnline ? "text-green-500" : "text-red-500";

      // ambil jabatan resmi dari mapping
      const jabatan = bidangMap[pejabat.bidang] || pejabat.bidang;

      pejabatInfo[pejabat.bidang] = {
        nama: pejabat.nama,
        jabatan: jabatan,
        status: pejabat.status
      };

      container.innerHTML += `
        <div>
          <span class="text-sm font-bold text-gray-700">${jabatan}</span>
          <div class="flex justify-between items-center">
            <span class="text-sm font-bold ${statusAtasan}">${pejabat.nama}</span>
            <span class="${statusColor} rounded-full px-2 py-1 text-xs font-medium flex items-center">
              <div class="w-1.5 h-1.5 ${dotColor} rounded-full mr-1.5"></div>
              ${statusText}
            </span>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("Error loading status:", err);
  }
}

loadStatus();
