function tampilkanTanggal() {
    const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' };
    const tanggal = new Intl.DateTimeFormat('id-ID', opsi).format(new Date());
    $('#tanggal').text(tanggal);
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
        submitForm() {
            if (!this.form.nama || !this.form.alamat || !this.form.asal || !this.form.keperluan) return;
            this.isSubmitting = true;
            // const self = this;
            // setTimeout(function() {
            //     console.log('Guest Book Entry:', { ...self.form, timestamp: new Date().toISOString(), id: Date.now().toString() });
            //     self.isSubmitting = false;
            //     self.showSuccess = true;
            // }, 1500);
            // Format tanggal Indonesia dd-MM-yyyy
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
