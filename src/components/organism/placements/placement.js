import ashish from "../../../assets/placements/ashish.png"
import sakshi from "../../../assets/placements/sakshi.png"
import sujith from "../../../assets/placements/sujith.png"
import prajwala from "../../../assets/placements/prajwala.png"

// Company logos are bundled, never hotlinked (#10). Every one of these used to
// be a URL on someone else's server — a 2016 SAP blog attachment, an unrelated
// financial news site, two signed LinkedIn CDN links. Any of them could 404 or
// be swapped without warning, and this is the most persuasive section on the
// site to render as broken images.
import sapHybris from "../../../assets/clients/sap-hybris.webp"
import hcl from "../../../assets/clients/hcl.jpg"
import skad from "../../../assets/clients/skad.jpg"
import qsg from "../../../assets/clients/qsg.jpg"




export let placements=[
    {
        name:"Ashish Jadhav",
        designation:"SAP Hybris Developer",
        image:ashish,
        company:{name:"SAP Hybris", logo:sapHybris},
        description:`Uday Sir is an exceptional mentor who transformed my career prospects. Despite being a non-IT background student from Maharashtra, I thrived under his guidance in Bangalore. His teaching style is concise, clear, and engaging. Uday Sir's patience and willingness to help are admirable. He creates a supportive environment, encouraging students to ask questions. His friendly nature makes complex concepts accessible and enjoyable.`
    },
    {
        name:"Sakshi",
        designation:"Software Engineer",
        image:sakshi,
        company:{name:"HCL Technologies", logo:hcl},
         description:`Uday Sir is an exceptional Java programming teacher, known for his deep knowledge and engaging teaching style. His ability to simplify complex concepts makes learning Java both easy and enjoyable. With a passion for coding and a dedication to his students' success, he ensures that everyone gains a strong foundation in programming. His guidance not only helps students master Java but also instills confidence in problem-solving and logical thinking.`
    },
    {
        name:"Sujith",
        designation:"Software Engineer",
        image:sujith,
        company:{name:"SKAD IT Solutions", logo:skad},
         description:`The coaching institute offers an exceptional Java and Python Full stack  course with comprehensive coverage of Core Java, Springs,Hibernate,SQL,Python,Django. Uday sir's expert guidance on backend development is complemented perfectly. His combined industry experience and personalized mentoring ensure students gain practical skills through hands-on projects. The institute maintains small batch sizes, creating an interactive learning environment.`
        
    },
    {
        name:"Prajwala R",
        designation:"Test Automation Engineer",
        image:prajwala,
        company:{name:"Quality Service Group", logo:qsg},
         description:`Uday sir is a fantastic Java trainer who breaks down complex topics into simple, easy-to-grasp concepts. He creates a supportive learning environment that encourages students to ask questions and grow. What sets him apart is his ability to adapt to different learning styles and pace.I'm grateful for his mentorship, which helped me achieve my goals. Finally thanks to all the team members of rest coder academy.`
        
    },
    
]