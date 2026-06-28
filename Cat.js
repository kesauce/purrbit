export default class Cat {
    
	constructor(name) {
		this.name = name;

        // Define all the stats
		this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.cleanliness = 100;
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
     * @param {number} restValue 
     */
    rest(restValue){
        this.energy += restValue;
    }
    
    /**
     * Groom the cat and increase cleanliness
     * @param {number} groomValue 
     */
    groom(groomValue){
        this.cleanliness += groomValue;
    }

    // ────── Get Functions ──────

    getName(){ return this.name; }

    getHunger(){ return this.hunger; }

    getHappiness(){ return this.happiness; }

    getEnergy(){ return this.energy; }
    
    getCleanliness(){ return this.cleanliness; }
}
