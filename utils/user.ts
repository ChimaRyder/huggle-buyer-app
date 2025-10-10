import { API_BASE_URL } from "./constants";

export const CreateBuyerAccount = async (
  token: string | null = null,
  id: string,
  name: string,
  email: string
) => {
  const data = {
    id: id,
    name: name,
    emailAddress: email,
  };
  try {
    const response = await fetch(`${API_BASE_URL}/api/buyers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating buyer account:", error);
    throw error;
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
