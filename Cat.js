export default class Cat {
    
	constructor(name) {
		this.name = name;

        // Define all the stats
		this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.cleanliness = 100;
        this.status = "Happy";
	}
    
    // ────── Status Functions ──────

    /**
     * Feed the cat and increase hunger
     * @param {number} foodValue 
     */
    feed(foodValue){
        this.hunger += foodValue;
    }

    /**
     * Play with the cat and increase happiness
     * @param {number} playValue 
     */
    play(playValue){
        this.happiness += playValue;
    }

    /**
     * Put the cat to sleep and increase energy
     */
    rest(){
        const restInterval = setInterval(() => {
            this.energy = Math.min(100, this.energy + 5);
            if (this.energy >= 80) {
                clearInterval(restInterval);
            }
        }, 1000 * 60);
    }
    
    /**
     * Groom the cat and increase cleanliness
     * @param {number} groomValue 
     */
    groom(groomValue){
        this.cleanliness += groomValue;
    }

    pet() {
        this.happiness = Math.min(100, this.happiness + 5);
    }

    updateStats() {
        this.hunger = Math.max(0, this.hunger - 1); //Supposed to be 1, using 20 for testing
        this.happiness = Math.max(0, this.happiness - 1);
        this.energy = Math.max(0, this.energy - 20);
        this.cleanliness = Math.max(0, this.cleanliness - 1);
    }

    setStatus(mood) {
        this.status = mood;
    }
    // ────── Get Functions ──────

    getName(){ return this.name; }

    getHunger(){ return this.hunger; }

    getHappiness(){ return this.happiness; }

    getEnergy(){ return this.energy; }
    
    getCleanliness(){ return this.cleanliness; }

    getStatus(){ return this.status; }
}
