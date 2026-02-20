export default class Storage {

    static saveHighscore(newScore) {
        let stored = localStorage.getItem("highscore");

        if (!stored || newScore > parseInt(stored)) {
            localStorage.setItem("highscore", newScore);
        }
        Storage.downloadHighscore(newScore);
    }

    static loadHighscore() {
        let stored = localStorage.getItem("highscore");
        return stored ? parseInt(stored) : 0;
    }

    static downloadHighscore(score) {
        const text = "Highscore: " + score;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "highscore.txt";
        a.click();

        URL.revokeObjectURL(url);
    }
}