import moment from 'moment';
import { greet } from './module'; 
import './style.css';

console.log(greet("angga"));
console.log("Hello from index.js");
console.log("Sekarang:", moment().format('dddd, MMMM Do YYYY, h:mm A'));

class AppBar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div>Aplikasi Catatan</div>`;
    }
}
customElements.define('app-bar', AppBar);

// Custom element untuk note-form
class NoteForm extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <form id="noteForm">
          <input type="text" id="noteTitle" placeholder="Judul Catatan" required />
          <textarea id="noteBody" rows="5" placeholder="Isi Catatan" required></textarea>
          <button type="submit">Tambah Catatan</button>
        </form>
      `;

        const form = this.querySelector('#noteForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const title = this.querySelector('#noteTitle').value;
            const body = this.querySelector('#noteBody').value;

            if (title && body) {
                try {
                    const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ title, body })
                    });

                    if (!response.ok) throw new Error("Gagal menambahkan catatan");

                    document.querySelector('notes-list').render(); // Refresh daftar catatan
                    form.reset();
                } catch (error) {
                    console.error("Error:", error.message);
                }
            }
        });
    }
}
customElements.define('note-form', NoteForm);

// Custom element untuk notes-list
class NotesList extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    async render() {
        const res = await fetch("https://notes-api.dicoding.dev/v2/notes");
        const {data} = await res.json();
        console.log(data);
        this.innerHTML = ''; // Menghapus tampilan lama
        data.forEach((note) => {
            const noteItem = document.createElement('note-item');
            noteItem.setAttribute('note-id', note.id); // Ganti id dengan note-id
            noteItem.setAttribute('title', note.title);
            noteItem.setAttribute('body', note.body);
            noteItem.setAttribute('createdAt', note.createdAt);  // Mengirimkan tanggal
            this.appendChild(noteItem);
        });
    }
}
customElements.define('notes-list', NotesList);

// Custom element untuk note-item
class NoteItem extends HTMLElement {
    static get observedAttributes() {
        return ['note-id', 'title', 'body', 'createdAt'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'note-id') {
            this.idValue = newValue;
        } else if (name === 'title') {
            this.title = newValue;
        } else if (name === 'body') {
            this.body = newValue;
        } else if (name === 'createdAt') {
            this.createdAt = newValue;
        }
        this.render();
    }

    async removeNote() {
        const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus catatan "${this.title}"?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${this.idValue}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal menghapus data dari API');
            }

            console.log(`Catatan dengan ID '${this.idValue}' berhasil dihapus dari API.`);
            this.remove(); // Hapus elemen dari DOM
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            alert('Gagal menghapus catatan. Silakan coba lagi.');
        }
    }

    render() {
        // Gunakan moment untuk format tanggal
        const formattedDate = moment(this.createdAt).format('dddd, MMMM Do YYYY, h:mm A');

        this.innerHTML = `
        <div>
            <h3>${this.title || ''}</h3>
            <p>${this.body || ''}</p>
            <small>ID: ${this.idValue || ''}</small><br>
            <small>Created on: ${formattedDate}</small>
            <button class="delete-btn">Hapus</button>
        </div>
      `;
        this.querySelector('.delete-btn').addEventListener('click', () => {
            this.removeNote();
        });
    }
}
customElements.define('note-item', NoteItem);

// Memuat ulang catatan setelah halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('notes-list').render();
});
