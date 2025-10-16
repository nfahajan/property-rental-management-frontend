import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "../../public/assets/mainlogo.png";

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-100 text-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-20 flex  items-center">
                <Image
                  src={logo}
                  alt="logo"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <p className=" mb-6 text-pretty leading-relaxed">
              Your trusted partner in finding the perfect rental property. We
              make home hunting simple and stress-free.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#properties" className=" transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className=" transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className=" transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className=" transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="#" className=" transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="">
                  123 Real Estate Ave, New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span className="">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span className="">info@homenest.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className=" mb-4 text-pretty">
              Subscribe to get the latest property listings and updates.
            </p>
            <div className="flex flex-col gap-2">
              <Input type="email" placeholder="Your email" className="" />
              <Button variant="default" className="w-full">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className=" text-sm">© 2025 HomeNest. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className=" transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className=" transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className=" transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
