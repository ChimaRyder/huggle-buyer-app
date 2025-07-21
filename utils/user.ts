import { API_BASE_URL } from "./api";

export const CreateBuyerAccount = async (
  token: string,
  id: string,
  name: string,
  email: string
) => {
  const data = {
    id: id,
    name: name,
    emailAddress: email,
  };
  console.log(data);
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },

      body: data ? JSON.stringify(data) : null,
    });
  } catch (error) {
    console.error(error);
  }
};

// Update buyer location
export const updateBuyerLocation = async (
  buyerId: string,
  longitude: number,
  latitude: number,
  token: string | null = null
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/buyer/${buyerId}/location`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ longitude, latitude }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating buyer location:`, error);
    throw error;
  }
};

export const fetchBuyerById = async (
  buyerId: string,
  token: string | null = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyer/${buyerId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
