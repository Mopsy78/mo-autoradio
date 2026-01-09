// client/main.js

// Radio-Zustand
let radioOn = false;
let currentStation = "OFF";

const stationNames = {
    "RADIO_37_MOTOMAMI": "MOTOMAMI Los Santos",
    "RADIO_35_DLC_HEI4_MLR": "The Music Locker",
    "RADIO_12_REGGAE": "Blue Ark",
    "RADIO_13_JAZZ": "Worldwide FM",
    "RADIO_14_DANCE_02": "FlyLo FM",
    "RADIO_15_MOTOWN": "The Lowdown 91.1",
    "RADIO_20_THELAB": "The Lab",
    "RADIO_16_SILVERLAKE": "Radio Mirror Park",
    "RADIO_34_DLC_HEI4_KULT": "Kult FM",
    "RADIO_17_FUNK": "Space 103.2",
    "RADIO_18_90S_ROCK": "Vinewood Boulevard Radio",
    "RADIO_21_DLC_XM17": "Blonded Los Santos 97.8 FM",
    "RADIO_22_DLC_BATTLE_MIX1_RADIO": "Los Santos Underground Radio",
    "RADIO_23_DLC_XM19_RADIO": "iFruit Radio",
    "RADIO_01_CLASS_ROCK": "Los Santos Rock Radio",
    "RADIO_02_POP": "Non-Stop-Pop FM",
    "RADIO_03_HIPHOP_NEW": "Radio Los Santos",
    "RADIO_04_PUNK": "Channel X",
    "RADIO_05_TALK_01": "West Coast Talk Radio",
    "RADIO_06_COUNTRY": "Rebel Radio",
    "RADIO_07_DANCE_01": "Soulwax FM",
    "RADIO_08_MEXICAN": "East Los FM",
    "RADIO_09_HIPHOP_OLD": "West Coast Classics"
};

const stations = Object.keys(stationNames);

// Hilfsfunktionen

function disableGtaRadio() {
    SetRadioToStationName("OFF");             // Radio aus
    SetUserRadioControlEnabled(false);        // Standard-Radio-Tasten deaktiviert
}

// Neue Funktion: zeigt/verdeckt HUD
function showRadioHUD(show) {
    SendNuiMessage(JSON.stringify({
        action: "updateRadio",
        radioOn: show,
        station: show && currentStation !== "OFF" ? stationNames[currentStation] : null
    }));
}

function updateRadioHUD() {
    showRadioHUD(radioOn);
}

// Radio an/aus
function toggleRadio() {
    radioOn = !radioOn;
    if (radioOn && currentStation === "OFF") currentStation = stations[0];

    const veh = GetVehiclePedIsIn(PlayerPedId(), false);
    if (veh !== 0) {
        if (radioOn) SetVehRadioStation(veh, currentStation);
        else SetVehRadioStation(veh, "OFF");
    }

    updateRadioHUD(); // HUD direkt aktualisieren
}

// Nächste / vorherige Station
function nextStation() {
    let index = stations.indexOf(currentStation);
    index = (index + 1) % stations.length;
    currentStation = stations[index];

    const veh = GetVehiclePedIsIn(PlayerPedId(), false);
    if (veh !== 0 && radioOn) SetVehRadioStation(veh, currentStation);

    updateRadioHUD();
}

function prevStation() {
    let index = stations.indexOf(currentStation);
    index = (index - 1 + stations.length) % stations.length;
    currentStation = stations[index];

    const veh = GetVehiclePedIsIn(PlayerPedId(), false);
    if (veh !== 0 && radioOn) SetVehRadioStation(veh, currentStation);

    updateRadioHUD();
}

// Hotkeys Numpad
RegisterCommand("radio_toggle", toggleRadio, false);
RegisterKeyMapping("radio_toggle", "Radio an/aus", "keyboard", "NUMPAD0");

RegisterCommand("radio_next", nextStation, false);
RegisterKeyMapping("radio_next", "Nächste Station", "keyboard", "MULTIPLY");

RegisterCommand("radio_prev", prevStation, false);
RegisterKeyMapping("radio_prev", "Vorherige Station", "keyboard", "DIVIDE");

// Fahrzeugwechsel-Check
let lastVeh = 0;
let lastEngineState = false;

setTick(() => {
    const ped = PlayerPedId();
    const veh = GetVehiclePedIsIn(ped, false);

    // Fahrzeug gewechselt
    if (veh !== lastVeh) {
        radioOn = false;
        currentStation = "OFF";
        showRadioHUD(false); // HUD ausblenden
        lastVeh = veh;
    }

    if (veh !== 0) {
        const engineOn = GetIsVehicleEngineRunning(veh);

        // Motor gerade gestartet
        if (engineOn && !lastEngineState && !radioOn) {
            SetVehRadioStation(veh, "OFF");
        }

        lastEngineState = engineOn;

        // Radio generell aus erzwingen, wenn es aus ist
        if (!radioOn) {
            SetVehRadioStation(veh, "OFF");
        }
    }

    // Original Radio HUD ausblenden
    HideHudComponentThisFrame(16);
});
