import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container max-w-4xl py-6 px-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">PRIVACY POLICY</h1>
          <p className="text-muted-foreground mb-8">Last updated December 29, 2025</p>

          <p className="mb-6">
            This Privacy Notice for motorClub il ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Visit our website at https://www.motorclub.co.il or any website of ours that links to this Privacy Notice</li>
            <li>Download and use our mobile application (motorclub), or any other application of ours that links to this Privacy Notice</li>
            <li>Engage with us in other related ways, including any marketing or events</li>
          </ul>

          <p className="mb-8">
            Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:yoni2435@gmail.com" className="text-primary hover:underline">yoni2435@gmail.com</a>.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">SUMMARY OF KEY POINTS</h2>
          <p className="mb-4 italic">This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.</p>

          <div className="space-y-4 mb-8">
            <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</p>
            
            <p><strong>Do we process any sensitive personal information?</strong> Some of the information may be considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.</p>
            
            <p><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</p>
            
            <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so.</p>
            
            <p><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</p>
            
            <p><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.</p>
            
            <p><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</p>
            
            <p><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">TABLE OF CONTENTS</h2>
          <ol className="list-decimal pl-6 mb-8 space-y-1">
            <li>WHAT INFORMATION DO WE COLLECT?</li>
            <li>HOW DO WE PROCESS YOUR INFORMATION?</li>
            <li>WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</li>
            <li>WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</li>
            <li>DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</li>
            <li>DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</li>
            <li>HOW LONG DO WE KEEP YOUR INFORMATION?</li>
            <li>HOW DO WE KEEP YOUR INFORMATION SAFE?</li>
            <li>WHAT ARE YOUR PRIVACY RIGHTS?</li>
            <li>CONTROLS FOR DO-NOT-TRACK FEATURES</li>
            <li>DO WE MAKE UPDATES TO THIS NOTICE?</li>
            <li>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</li>
            <li>HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
          <h3 className="text-xl font-semibold mb-2">Personal information you disclose to us</h3>
          <p className="mb-4"><em>In Short: We collect personal information that you provide to us.</em></p>
          
          <p className="mb-4">We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
          
          <p className="mb-2"><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>names</li>
            <li>email addresses</li>
            <li>job titles</li>
            <li>usernames</li>
            <li>passwords</li>
            <li>business addresses</li>
          </ul>

          <p className="mb-4"><strong>Sensitive Information.</strong> We do not process sensitive information.</p>

          <p className="mb-2"><strong>Application Data.</strong> If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><em>Geolocation Information.</em> We may request access or permission to track location-based information from your mobile device, either continuously or while you are using our mobile application(s), to provide certain location-based services. If you wish to change our access or permissions, you may do so in your device's settings.</li>
            <li><em>Mobile Device Access.</em> We may request access or permission to certain features from your mobile device, including your mobile device's camera, microphone, storage, location, and other features. If you wish to change our access or permissions, you may do so in your device's settings.</li>
          </ul>

          <p className="mb-8">This information is primarily needed to maintain the security and operation of our application(s), for troubleshooting, and for our internal analytics and reporting purposes. All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
          <p className="mb-4"><em>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</em></p>
          
          <p className="mb-2">We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>To facilitate account creation and authentication</strong> and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.</li>
            <li><strong>To deliver and facilitate delivery of services to the user.</strong> We may process your information to provide you with the requested service.</li>
            <li><strong>To enable user-to-user communications.</strong> We may process your information if you choose to use any of our offerings that allow for communication with another user.</li>
            <li><strong>To deliver targeted advertising to you.</strong> We may process your information to develop and display personalized content and advertising tailored to your interests, location, and more.</li>
            <li><strong>To evaluate and improve our Services, products, marketing, and your experience.</strong> We may process your information when we believe it is necessary to identify usage trends, determine the effectiveness of our promotional campaigns, and to evaluate and improve our Services, products, marketing, and your experience.</li>
            <li><strong>To identify usage trends.</strong> We may process information about how you use our Services to better understand how they are being used so we can improve them.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
          <p className="mb-8">We may share information in specific situations described in this section and/or with specific third parties.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</h2>
          <p className="mb-8"><em>In Short: We are not responsible for the safety of any information that you share with third parties that we may link to or who advertise on our Services, but are not affiliated with, our Services.</em></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
          <p className="mb-8"><em>In Short: We may use cookies and other tracking technologies to collect and store your information.</em></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
          <p className="mb-8"><em>In Short: We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</em></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          <p className="mb-8"><em>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</em></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
          <p className="mb-8"><em>In Short: We aim to protect your personal information through a system of organizational and technical security measures.</em></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          <p className="mb-8"><em>In Short: You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</em></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          <p className="mb-8">Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
          <p className="mb-8"><em>In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></p>

          <h2 className="text-2xl font-bold mt-8 mb-4">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          <p className="mb-8">If you have questions or comments about this notice, you may email us at <a href="mailto:yoni2435@gmail.com" className="text-primary hover:underline">yoni2435@gmail.com</a>.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
          <p className="mb-8">Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information.</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
