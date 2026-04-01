const BASE_ID = "appdSEBglIwFE2h0D";
const TABLE_ID = "tbl9UwkQStPKYH4J3";
const LISTA_ESPERA_TABLE_ID = "tblRmFxBXbB8j9APP";
const TOTAL_STOCK = 30;
const TABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
const LISTA_ESPERA_URL = `https://api.airtable.com/v0/${BASE_ID}/${LISTA_ESPERA_TABLE_ID}`;

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function getStock() {
  const params = new URLSearchParams({
    filterByFormula: "{Pagado}=1",
    "fields[]": "Pagado",
  });
  const res = await fetch(`${TABLE_URL}?${params}`, { headers: headers() });
  const data = await res.json();
  const sold: number = data.records?.length ?? 0;
  return { total: TOTAL_STOCK, sold, available: TOTAL_STOCK - sold };
}

export async function createReservation(data: {
  nombre: string;
  apellido: string;
  cumpleanos: string;
  celular: string;
  email: string;
  listaEspera?: boolean;
}) {
  if (data.listaEspera) {
    const res = await fetch(LISTA_ESPERA_URL, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        fields: {
          Nombre: data.nombre,
          Apellido: data.apellido,
          "Fecha de nacimiento": data.cumpleanos,
          Celular: data.celular,
          Email: data.email,
          "Fecha registro": new Date().toISOString(),
        },
      }),
    });
    if (!res.ok) return { error: "Error al guardar" };
    const record = await res.json();
    return { id: record.id as string };
  }

  const stock = await getStock();
  if (stock.sold >= TOTAL_STOCK) {
    return { error: "No quedan roscas disponibles" };
  }

  const res = await fetch(TABLE_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      fields: {
        Nombre: data.nombre,
        Apellido: data.apellido,
        "Fecha de nacimiento": data.cumpleanos,
        Celular: data.celular,
        Email: data.email,
        "Fecha reserva": new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    return { error: "Error al guardar la reserva" };
  }

  const record = await res.json();
  return { id: record.id as string };
}

export async function markAsPaid(id: string, mpPaymentId: string) {
  await fetch(`${TABLE_URL}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({
      fields: {
        Pagado: true,
        "MP Payment ID": mpPaymentId,
      },
    }),
  });
}

export async function getReservation(id: string) {
  const res = await fetch(`${TABLE_URL}/${id}`, { headers: headers() });
  if (!res.ok) return null;
  const record = await res.json();
  return {
    id: record.id,
    nombre: record.fields.Nombre,
    apellido: record.fields.Apellido,
    cumpleanos: record.fields["Fecha de nacimiento"],
    celular: record.fields.Celular,
    email: record.fields.Email,
    paid: record.fields.Pagado ? 1 : 0,
    mp_payment_id: record.fields["MP Payment ID"],
    created_at: record.fields["Fecha reserva"],
  };
}
