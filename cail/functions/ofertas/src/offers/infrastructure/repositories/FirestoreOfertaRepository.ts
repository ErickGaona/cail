import { getFirestore } from '../../../config/firebase.config';
import { Oferta, OfertaProps } from '../../domain/entities/Oferta.entity';
import { IOfertaRepository, OfertaFilters } from '../../domain/repositories/IOfertaRepository';

/**
 * Repositorio de Ofertas usando Firestore
 * Colección: ofertas (Esquema Ofertas según el diagrama)
 */
export class FirestoreOfertaRepository implements IOfertaRepository {
    private getCollection() {
        return getFirestore().collection('ofertas');
    }

    async save(oferta: Oferta): Promise<Oferta> {
        const data = {
            ...oferta.toJSON(),
            updatedAt: new Date(),
        };
        await this.getCollection().doc(oferta.idOferta).set(data, { merge: true });
        return oferta;
    }

    async findById(id: string): Promise<Oferta | null> {
        const doc = await this.getCollection().doc(id).get();
        if (!doc.exists) return null;
        return this.mapToEntity(doc.data()!);
    }

    async findAll(filters?: OfertaFilters): Promise<Oferta[]> {
        let query: FirebaseFirestore.Query = this.getCollection();

        if (filters?.estado) {
            query = query.where('estado', '==', filters.estado);
        }
        if (filters?.ciudad) {
            query = query.where('ciudad', '==', filters.ciudad);
        }
        if (filters?.modalidad) {
            query = query.where('modalidad', '==', filters.modalidad);
        }

        query = query.orderBy('fechaPublicacion', 'desc');

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => this.mapToEntity(doc.data()));
    }

    async findByReclutador(idReclutador: string): Promise<Oferta[]> {
        const snapshot = await this.getCollection()
            .where('idReclutador', '==', idReclutador)
            .orderBy('fechaPublicacion', 'desc')
            .get();
        return snapshot.docs.map(doc => this.mapToEntity(doc.data()));
    }

    async delete(id: string): Promise<void> {
        await this.getCollection().doc(id).delete();
    }

    private mapToEntity(data: any): Oferta {
        return new Oferta({
            idOferta: data.idOferta,
            titulo: data.titulo,
            descripcion: data.descripcion,
            empresa: data.empresa,
            ciudad: data.ciudad,
            modalidad: data.modalidad,
            tipoContrato: data.tipoContrato,
            salarioMin: data.salarioMin,
            salarioMax: data.salarioMax,
            experiencia_requerida: data.experiencia_requerida,
            formacion_requerida: data.formacion_requerida,
            competencias_requeridas: data.competencias_requeridas || [],
            fechaPublicacion: data.fechaPublicacion?.toDate?.() || new Date(data.fechaPublicacion),
            fechaCierre: data.fechaCierre?.toDate?.() || undefined,
            estado: data.estado,
            idReclutador: data.idReclutador,
        });
    }
}
