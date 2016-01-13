module.exports = [{
    "id": 1,
    "name": "ADTool",
    "publisher": "University of Luxembourg",
    "url": "https://trespass.itrust.lu/jnlp/ADTool.jnlp",
    "hasInput": false,
    "description": "The Attack-Defense Tree Tool (ADTool) allows users to model and analyse attack-defense scenarios represented with attack-defense trees and attack-defense terms. It supports the methodology developed within the ATREES project.",
    "types": ["visualisation", "analysis"]
}, {
    "id": 2,
    "name": "TRICK Service ",
    "publisher": "itrust consulting",
    "url": "https://trespass-tl.itrust.lu/",
    "hasInput": false,
    "description": "Trick service assesses quantitative risks and fulfils risk treatment operations according to the user-configured referential standards (ISO 27001, 27002, etc.). It outputs the risk treatment plan which prioritises the implementation of security measures according to their Return On Security Investment (ROSI), risk specificities and feasibility.",
    "types": ["analysis"]
}, {
    "id": 3,
    "name": "A.T. Analyzer",
    "publisher": "Cybernetica",
    "hasInput": true,
    "description": "The attack tree computation tool can be used to calculate optimal attack vector (from the attacker point of view) taking attacker profile into account.",
    "types": ["analysis"],
    "resources": {
        "Input file for testing": "https://trespass.itrust.lu/data/approxtree.txt"
    }
}, {
    "id": 5,
    "name": "Failure-free Model",
    "publisher": "Cybernetica",
    "hasInput": true,
    "description": "This tool is able to assess if a system is secure against rational gain-oriented attackers. It takes an attack tree (with parameters for atomic actions) as the input.",
    "types": ["analysis"],
    "resources": {
        "Input file for testing": "https://trespass.itrust.lu/data/failureFreeModel.xml"
    }
}, {
    "id": 8,
    "name": "Attack Pattern Lib.",
    "publisher": "Cybernetica",
    "hasInput": true,
    "description": "The Attack Pattern Library (APL) is intended to promote the reuse of modular elements to improve the process of model development.",
    "types": ["analysis"],
    "resources": {
        "Input file for testing": "https://trespass.itrust.lu/data/apl.xml"
    }
}, {
    "id": 12,
    "name": "ATCalc",
    "publisher": "University of Twente",
    "url": "http://fmt.ewi.utwente.nl/puptol/atcalc/",
    "hasInput": false,
    "description": "ATCalc is a tool for efficient Attack Tree Analysis. It computes the system unreliability for each mission time, i.e. the probability that the system fails within the mission time. Further it is capable of computing the mean time to failure (MTTF), i.e. the expected time that the system will fail. ATCalc uses <a href=\"http://cadp.inria.fr/\">CADP</a>, a proprietary software owned by Inria.",
    "types": ["analysis"]
}, {
    "id": 16,
    "name": "ATree Evaluator",
    "publisher": "T. University of Denmark",
    "url": "https://trespass.itrust.lu/jnlp/AttackTreeEvaluator.jnlp",
    "hasInput": false,
    "description": "Computes the Pareto set of pairs with maximum probability and minimum cost, if costs are provided. The tool addresses multi-parameter optimisation of attack trees in terms of Pareto efficiency.",
    "types": ["analysis"],
    "resources": {
        "Input file for testing": "https://trespass.itrust.lu/data/attacktree-example.xml"
    }
}]
